TOKEN_BLUEPRINT = [===[
do
local _ENV = _ENV
package.preload[ "token.token_lib" ] = function( ... ) local arg = _G.arg;
local bint  = require ".bint" (256)
local json  = require "json"

local utils = {
    add = function(a, b)
        return tostring(bint(a) + bint(b))
    end,
    subtract = function(a, b)
        return tostring(bint(a) - bint(b))
    end,
    toBalanceValue = function(a)
        return tostring(bint(a))
    end,
    toNumber = function(a)
        return tonumber(a)
    end
}

local mod                     = {}

mod.calculateAvailableBalance = function(address, timestamp)
    assert(address, "Address is required")
    assert(timestamp, "Timestamp is required")

    local bal = Balances[address] or "0"
    local vested = Vesting[address] or { Amount = "0", Until = "0" }

    local stillVested = vested.Amount

    -- if time passed the stillVested amount should be 0
    if (tonumber(vested.Until) <= tonumber(timestamp)) then
        stillVested = "0"
    end

    local availableBalance = bint(bal) - bint(stillVested)

    return {
        Available = tostring(availableBalance),
        ["Vested-Amount"] = stillVested,
        ["Vested-Until"] = vested.Until,
        ["Total-Balance"] = bal
    }
end

mod.getInfo                   = function(msg)
    local replyData = nil
    local replyTags = {
        Name = Name,
        Ticker = Ticker,
        Logo = Logo,
        Denomination = tostring(Denomination),
        TotalSupply = TotalSupply,
        TransferRestricted = tostring(AllowedSenders ~= nil)
    }
    return mod.sendReply(msg, replyData, replyTags)
end

mod.getTotalSupply            = function(msg)
    local replyData = TotalSupply
    local replyTags = {
        Ticker = Ticker,
    }
    return mod.sendReply(msg, replyData, replyTags)
end

mod.getBalance                = function(msg)
    assert(msg.Tags.Recipient or msg.Tags.Target or msg.From, "Recipient, Target or From required")
    assert(msg.Timestamp, "Timestamp is required")

    local account = msg.Tags.Recipient or msg.Tags.Target or msg.From

    local balance = mod.calculateAvailableBalance(account, msg.Timestamp)

    local replyData = balance.Available
    local replyTags = {
        Ticker = Ticker,
        Account = account,
        Balance = balance.Available,
        ["Vested-Amount"] = balance["Vested-Amount"],
        ["Vested-Until"] = balance["Vested-Until"],
        ["Total-Balance"] = balance["Total-Balance"],
        ["Current-Timestamp"] = tostring(msg.Timestamp),
    }
    return mod.sendReply(msg, replyData, replyTags)
end

mod.getBalances               = function(msg)
    local balances = {}

    for account in pairs(Balances) do
        local availableBalance = mod.calculateAvailableBalance(account, msg.Timestamp)
        balances[account] = availableBalance.Available
    end

    local replyData = balances
    return mod.sendReply(msg, replyData)
end

mod.getBalancesDetailed       = function(msg)
    local balances = {}

    for account in pairs(Balances) do
        local availableBalance = mod.calculateAvailableBalance(account, msg.Timestamp)

        balances[account] = {
            Balance = availableBalance.Available,
            ["Vested-Amount"] = availableBalance["Vested-Amount"],
            ["Vested-Until"] = availableBalance["Vested-Until"],
            ["Total-Balance"] = availableBalance["Total-Balance"],
            ["Current-Timestamp"] = tostring(msg.Timestamp)
        }
    end

    local replyData = balances
    mod.sendReply(msg, replyData)
end

mod.transfer                  = function(msg)
    assert(type(msg.Tags.Recipient) == 'string', 'Recipient is required!')
    assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')
    assert(bint.__lt(0, bint(msg.Tags.Quantity)), 'Quantity must be greater than 0')

    if not Balances[msg.From] then Balances[msg.From] = "0" end
    if not Balances[msg.Tags.Recipient] then Balances[msg.Tags.Recipient] = "0" end

    local balance = mod.calculateAvailableBalance(msg.From, msg.Timestamp)

    if bint.__le(bint(msg.Tags.Quantity), bint(balance.Available)) then
        Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Tags.Quantity)
        Balances[msg.Tags.Recipient] = utils.add(Balances[msg.Tags.Recipient], msg.Tags.Quantity)

        --[[
         Only send the notifications to the Sender and Recipient
         if the Cast tag is not set on the Transfer message
       ]]
        --
        if not msg.Tags.Cast then
            -- Debit-Notice message template, that is sent to the Sender of the transfer
            local debitNotice = {
                Target = msg.From,
                Action = 'Debit-Notice',
                Recipient = msg.Tags.Recipient,
                Quantity = msg.Tags.Quantity,
                Data = "You transferred " .. msg.Tags.Quantity .. " to " .. msg.Tags.Recipient
            }
            -- Credit-Notice message template, that is sent to the Recipient of the transfer
            local creditNotice = {
                Target = msg.Tags.Recipient,
                Action = 'Credit-Notice',
                Sender = msg.From,
                Quantity = msg.Tags.Quantity,
                Data = "You received " .. msg.Tags.Quantity .. " from " .. msg.From
            }

            -- Add forwarded tags to the credit and debit notice messages
            for tagName, tagValue in pairs(msg) do
                -- Tags beginning with "X-" are forwarded
                if string.sub(tagName, 1, 2) == "X-" then
                    debitNotice[tagName] = tagValue
                    creditNotice[tagName] = tagValue
                end
            end

            -- Send Debit-Notice and Credit-Notice
            msg.reply(debitNotice)
            ao.send(creditNotice)
        end
    else
        local replyError = 'Insufficient Balance!'
        local replyTags = {
            ['Message-Id'] = msg.Id,
        }
        mod.sendError(msg, replyError, replyTags)
    end
end

-- use for read-only query responses
function mod.sendReply(msg, data, tags)
    msg.reply({
        Action = msg.Tags.Action .. "-Response",
        Tags = tags,
        Data = json.encode(data)
    })
end

-- use for error messages
-- !! does not msg.reply, should not be used to conclude handlers from which a msg.reply() is expected
function mod.sendError(msg, error, tags)
    ao.send({
        Target = msg.From,
        Action = msg.Tags.Action .. "-Error",
        Tags = tags,
        Status = "Error",
        Error = error
    })
end

return mod
end
end

local token_lib   = require "token.token_lib"
local json        = require "json"

Variant           = "0.0.5"

-- token should be idempotent and not change previous state updates
Denomination      = Denomination or tonumber(ao.env.Process.Tags["Denomination"])
Balances          = Balances or json.decode(ao.env.Process.Tags["Balances"])
TotalSupply       = TotalSupply or ao.env.Process.Tags["TotalSupply"]
Vesting           = Vesting or json.decode(ao.env.Process.Tags["Vesting"])

Name              = Name or ao.env.Process.Tags["Name"]
Ticker            = Ticker or ao.env.Process.Tags["Ticker"]
Logo              = Logo or ao.env.Process.Tags["Logo"]

Handlers.add('info',
    Handlers.utils.hasMatchingTag('Action', 'Info'),
    token_lib.getInfo
)

Handlers.add('totalSupply',
    Handlers.utils.hasMatchingTag('Action', 'Total-Supply'),
    token_lib.getTotalSupply
)

Handlers.add('balance',
    Handlers.utils.hasMatchingTag('Action', 'Balance'),
    token_lib.getBalance
)

Handlers.add('balances',
    Handlers.utils.hasMatchingTag('Action', 'Balances'),
    token_lib.getBalances
)

Handlers.add('balancesDetailed',
    Handlers.utils.hasMatchingTag('Action', 'Balances-Detailed'),
    token_lib.getBalancesDetailed
)

--[[
     Transfer
   ]] 
--
Handlers.add('transfer',
    Handlers.utils.hasMatchingTag('Action', 'Transfer'),
    token_lib.transfer
)

if ao.env.Process.Tags["Renounce-Ownership"] == "true" then
    Owner = ''
else
    Owner = ao.env.Process.Tags["Deployer"]
end
]===] 

return TOKEN_BLUEPRINT

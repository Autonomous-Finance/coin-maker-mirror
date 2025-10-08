local bint                    = require ".bint" (256)
local json                    = require "json"

local utils                   = {
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

        -- Patch the balances cache
        local patchMsg = {
            device = 'patch@1.0',
            balances = {},
            ['token-info'] = {
                name = Name,
                ticker = Ticker,
                logo = Logo,
                denomination = tostring(Denomination),
                supply = TotalSupply
            }
        }

        patchMsg.balances[msg.From] = Balances[msg.From]
        patchMsg.balances[msg.Tags.Recipient] = Balances[msg.Tags.Recipient]

        Send(patchMsg)
    else
        local replyError = 'Insufficient Balance!'
        local replyTags = {
            ['Message-Id'] = msg.Id,
        }
        mod.sendError(msg, replyError, replyTags)
    end
end

--[[
    Processes multiple transfers atomically from a CSV input

     The CSV format should be:
     recipient_address,quantity

     Example:
     wallet1,100
     wallet2,200

     Features:
     - Atomicity: Either all transfers succeed or all fail
     - Always sends a batch debit notice to the sender
     - Sends individual credit notices to recipients unless Cast tag is set
]]
mod.batchTransfer = function(msg)
    --[[
      Simple CSV parser that splits input by newlines and commas
      to create a 2D table of values.
    ]]
    local function parseCSV(csvText)
        local result = {}
        -- Split by newlines and process each line
        for line in csvText:gmatch("[^\r\n]+") do
            local row = {}
            -- Split line by commas and add each value to the row
            for value in line:gmatch("[^,]+") do
                table.insert(row, value)
            end
            table.insert(result, row)
        end
        return result
    end

    -- Parse CSV data and validate entries
    local rawRecords = parseCSV(msg.Data)
    assert(rawRecords and #rawRecords > 0, 'No transfer entries found in CSV')

    local transferEntries = {}
    local totalQuantity = "0"

    -- Validate each entry and calculate total transfer amount
    for i, record in ipairs(rawRecords) do
        local recipient = record[1]
        local quantity = record[2]

        assert(recipient and quantity, 'Invalid entry at line ' .. i .. ': recipient and quantity required')
        assert(string.match(quantity, "^%d+$"), 'Invalid quantity format at line ' .. i .. ': must contain only digits')
        assert(bint.ispos(bint(quantity)), 'Quantity must be greater than 0 at line ' .. i)

        table.insert(transferEntries, {
            Recipient = recipient,
            Quantity = quantity
        })

        totalQuantity = utils.add(totalQuantity, quantity)
    end

    -- Step 2: Check if sender has sufficient balance
    if not Balances[msg.From] then Balances[msg.From] = "0" end

    local balance = mod.calculateAvailableBalance(msg.From, msg.Timestamp)

    if not (bint(totalQuantity) <= bint(balance.Available)) then
        msg.reply({
            Action = 'Transfer-Error',
            ['Message-Id'] = msg.Id,
            Error = 'Insufficient Balance!'
        })
        return
    end

    -- Step 3: Prepare the balance updates
    local balanceUpdates = {}

    -- Patch the balances cache
    local patchMsg = {
        device = 'patch@1.0',
        balances = {},
        ['token-info'] = {
            name = Name,
            ticker = Ticker,
            logo = Logo,
            denomination = tostring(Denomination),
            supply = TotalSupply
        }
    }

    for _, entry in ipairs(transferEntries) do
        local recipient = entry.Recipient
        local quantity = entry.Quantity

        if not Balances[recipient] then Balances[recipient] = "0" end

        -- Aggregate multiple transfers to the same recipient
        if not balanceUpdates[recipient] then
            balanceUpdates[recipient] = utils.add(Balances[recipient], quantity)
        else
            balanceUpdates[recipient] = utils.add(balanceUpdates[recipient], quantity)
        end
    end

    -- Step 4: Apply the balance changes atomically
    Balances[msg.From] = utils.subtract(Balances[msg.From], totalQuantity)
    for recipient, newBalance in pairs(balanceUpdates) do
        Balances[recipient] = newBalance
        patchMsg.balances[recipient] = newBalance
    end

    -- Prepare the balances cache for patching
    patchMsg.balances[msg.From] = Balances[msg.From]

    -- Step 5: Always send a batch debit notice to the sender
    local batchDebitNotice = {
        Action = 'Batch-Debit-Notice',
        Count = tostring(#transferEntries),
        Total = totalQuantity,
        ['Batch-Transfer-Init-Id'] = msg.Id,
    }

    -- Forward any X- tags to the debit notice
    for tagName, tagValue in pairs(msg.Tags) do
        if string.sub(tagName, 1, 2) == "X-" then
            batchDebitNotice[tagName] = tagValue
        end
    end

    msg.reply(batchDebitNotice)

    -- Step 6: Send individual credit notices if Cast tag is not set
    if not msg.Cast then
        for _, entry in ipairs(transferEntries) do
            local creditNotice = {
                Target = entry.Recipient,
                Action = 'Credit-Notice',
                Sender = msg.From,
                Quantity = entry.Quantity,
                Data = "You received " .. entry.Quantity .. " from " .. msg.From
            }

            -- Forward any X- tags to the credit notices
            for tagName, tagValue in pairs(msg.Tags) do
                if string.sub(tagName, 1, 2) == "X-" then
                    creditNotice[tagName] = tagValue
                end
            end

            ao.send(creditNotice)
        end
    end

    -- Finally send patch message
    Send(patchMsg)
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

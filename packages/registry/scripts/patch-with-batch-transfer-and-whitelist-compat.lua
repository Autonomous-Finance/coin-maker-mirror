local bint      = require ".bint" (256)
local token_lib = require "token.token_lib"

local utils     = {
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

--[[
     Batch-Transfer

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
--
Handlers.add('batchTransfer',
  Handlers.utils.hasMatchingTag("Action", "Batch-Transfer"),
  function(msg)
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

    local balance = token_lib.calculateAvailableBalance(msg.From, msg.Timestamp)

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
    end

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
  end
)



-- WHITELIST PATCH

local enabled = AllowedSenders and #AllowedSenders > 1 or false
local allowedSenders = AllowedSenders

local result = ao.send({
  Target = "Zd7vLelhAEU0EBEZ5yszRC1n3V9Win4U-7mcprtSZvs",
  Action = "Install"
}).receive()

load(result.Data)()

WhitelistModule.state.Enabled = enabled
WhitelistModule.state.Whitelist = allowedSenders
AllowedSenders = nil

-- Send Patch message for info token and discovery
local patchMsg = {
  device = 'patch@1.0',
  ['token-info'] = {
    ['batch-transfer'] = true,
    ['whitelist-module'] = true,
    whitelist = {
      enabled = WhitelistModule.state.Enabled,
      addresses = WhitelistModule.state.Whitelist
    }
  }
}

Send(patchMsg)

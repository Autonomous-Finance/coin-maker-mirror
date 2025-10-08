---@diagnostic disable: duplicate-set-field
require("test.setup")()

_G.IsInUnitTest    = true -- set this per test file to keep ao.send() from doing anything
_G.VerboseTests    = 2    -- how much logging to see (0 - none at all, 1 - important ones, 2 - everything)
-- optional logging function that allows for different verbosity levels
_G.printVerb       = function(level)
    level = level or 2
    return function(...) -- define here as global so we can use it in application code too
        if _G.VerboseTests >= level then print(table.unpack({ ... })) end
    end
end

_G.Denomination    = 1
_G.Balances        = {
    ["0x123"] = "1000",
    ["0x456"] = "1000",
    ["0x789"] = "1000",
}
_G.TotalSupply     = 3000
_G.Vesting         = {
    ["0x123"] = { Amount = "0", Until = "0" },
    ["0x456"] = { Amount = "500", Until = "100" },
    ["0x789"] = { Amount = "0", Until = "0" },
}

_G.Name            = "Token Name"
_G.Ticker          = "TN"
_G.Logo            = "logo"

_G.Description     = "Description"
_G.Telegram        = "Telegram"
_G.Twitter         = "Twitter"
_G.Website         = "Website"

local token_lib    = require "token/token_lib"
local json         = require "json"

local resetGlobals = function()
    _G.Denomination = 1
    _G.Balances     = {
        ["0x123"] = "1000",
        ["0x456"] = "1000",
        ["0x789"] = "1000",
    }
    _G.TotalSupply  = 3000
    _G.Vesting      = {
        ["0x123"] = { Amount = "0", Until = "0" },
        ["0x456"] = { Amount = "500", Until = "100" },
        ["0x789"] = { Amount = "0", Until = "0" },
    }
    _G.Name         = "Token Name"
    _G.Ticker       = "TN"
    _G.Logo         = "logo"
    _G.Description  = "Description"
    _G.Telegram     = "Telegram"
    _G.Twitter      = "Twitter"
    _G.Website      = "Website"
end

describe("token", function()
    -- setup(function()
    --     token_lib.sendReply = function(message)
    --         return message
    --     end
    -- end)

    -- describe("getInfo", function()
    --     it("should return Name, Ticker, Logo, Denomination, TotalSupply", function()
    --         local message = {
    --             From = "0x123",
    --             Timestamp = "1",
    --             Action = "Info",
    --             Tags = {}
    --         }

    --         local details = token_lib.getInfo(message)

    --         assert(details ~= nil)
    --         assert(details.Target == message.From)
    --         assert(
    --             details.Tags.Name,
    --             details.Tags.Ticker,
    --             details.Tags.Logo,
    --             details.Tags.Denomination,
    --             details.Tags.TotalSupply,
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Name, "Token Name")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Tags.Logo, "logo")
    --         assert(details.Tags.Denomination, "1")
    --         assert(details.Tags.TotalSupply, "3000")

    --         -- reset globals
    --         resetGlobals()
    --     end)
    -- end)

    -- describe("getBalance", function()
    --     it("should return details when calling with Recipient tag", function()
    --         local message = {
    --             Action = "Balance",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = { Recipient = "0x123" }
    --         }

    --         local details = token_lib.getBalance(message)

    --         assert(details ~= nil)
    --         assert(
    --             details.Tags.Balance,
    --             details.Tags.Ticker,
    --             details.Tags.Balance,
    --             details.Tags["Vested-Amount"],
    --             details.Tags["Vested-Until"],
    --             details.Tags["Total-Balance"],
    --             details.Tags["Current-Timestamp"],
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Balance, "1000")
    --         assert(details.Tags["Vested-Amount"], "0")
    --         assert(details.Tags["Vested-Until"], "0")
    --         assert(details.Tags["Total-Balance"], "1000")
    --         assert(details.Tags["Current-Timestamp"], "1")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Data, "1000")
    --     end)

    --     it("should return details when calling with Target tag", function()
    --         local message = {
    --             Action = "Balance",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = { Target = "0x123" }
    --         }

    --         local details = token_lib.getBalance(message)

    --         assert(details ~= nil)
    --         assert(
    --             details.Tags.Balance,
    --             details.Tags.Ticker,
    --             details.Tags.Balance,
    --             details.Tags["Vested-Amount"],
    --             details.Tags["Vested-Until"],
    --             details.Tags["Total-Balance"],
    --             details.Tags["Current-Timestamp"],
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Balance, "1000")
    --         assert(details.Tags["Vested-Amount"], "0")
    --         assert(details.Tags["Vested-Until"], "0")
    --         assert(details.Tags["Total-Balance"], "1000")
    --         assert(details.Tags["Current-Timestamp"], "1")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Data, "1000")
    --     end)

    --     it("should return details when calling without Tags", function()
    --         local message = {
    --             Action = "Balance",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = {}
    --         }

    --         local details = token_lib.getBalance(message)

    --         assert(details ~= nil)
    --         assert(
    --             details.Tags.Balance,
    --             details.Tags.Ticker,
    --             details.Tags.Balance,
    --             details.Tags["Vested-Amount"],
    --             details.Tags["Vested-Until"],
    --             details.Tags["Total-Balance"],
    --             details.Tags["Current-Timestamp"],
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Balance, "1000")
    --         assert(details.Tags["Vested-Amount"], "0")
    --         assert(details.Tags["Vested-Until"], "0")
    --         assert(details.Tags["Total-Balance"], "1000")
    --         assert(details.Tags["Current-Timestamp"], "1")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Data, "1000")
    --     end)

    --     it("should return correct details when calling a Vested Account", function()
    --         local message = {
    --             Action = "Balance",
    --             From = "0x123",
    --             Timestamp = "50",
    --             Tags = { Recipient = "0x456" }
    --         }

    --         local details = token_lib.getBalance(message)

    --         assert(details ~= nil)
    --         assert(
    --             details.Tags.Balance,
    --             details.Tags.Ticker,
    --             details.Tags.Balance,
    --             details.Tags["Vested-Amount"],
    --             details.Tags["Vested-Until"],
    --             details.Tags["Total-Balance"],
    --             details.Tags["Current-Timestamp"],
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Balance, "500")
    --         assert(details.Tags["Vested-Amount"], "500")
    --         assert(details.Tags["Vested-Until"], "100")
    --         assert(details.Tags["Total-Balance"], "1000")
    --         assert(details.Tags["Current-Timestamp"], "50")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Data, "500")
    --     end)

    --     it("should return empty details when calling a non existent account", function()
    --         local message = {
    --             Action = "Balance",
    --             From = "0x123",
    --             Timestamp = "50",
    --             Tags = { Recipient = "0x1234" }
    --         }

    --         local details = token_lib.getBalance(message)

    --         assert(details ~= nil)
    --         assert(
    --             details.Tags.Balance,
    --             details.Tags.Ticker,
    --             details.Tags.Balance,
    --             details.Tags["Vested-Amount"],
    --             details.Tags["Vested-Until"],
    --             details.Tags["Total-Balance"],
    --             details.Tags["Current-Timestamp"],
    --             details.Tags["Response-For"]
    --         )
    --         assert(details.Tags["Response-For"], message.Action)
    --         assert(details.Tags.Balance, "0")
    --         assert(details.Tags["Vested-Amount"], "0")
    --         assert(details.Tags["Vested-Until"], "0")
    --         assert(details.Tags["Total-Balance"], "0")
    --         assert(details.Tags["Current-Timestamp"], "50")
    --         assert(details.Tags.Ticker, "TN")
    --         assert(details.Data, "0")
    --     end)
    -- end)

    -- describe("getBalances", function()
    --     it("should return details when calling", function()
    --         local message = {
    --             Action = "Balances",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = {}
    --         }

    --         local details = token_lib.getBalances(message)

    --         assert(details ~= nil)
    --         assert(details.Tags["Response-For"])
    --         assert(details.Tags["Response-For"], message.Action)

    --         local balances = json.decode(details.Data)

    --         assert(balances["0x123"], "1000")
    --         assert(balances["0x456"], "500")
    --     end)
    -- end)

    -- describe("transfer", function()
    --     it("should update balances on both the sender and recipient", function()
    --         local message = {
    --             Action = "Transfer",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = {
    --                 Recipient = "0x456",
    --                 Quantity = "100"
    --             }
    --         }

    --         token_lib.transfer(message)

    --         assert(Balances["0x123"], "900")
    --         assert(Balances["0x456"], "1100")

    --         -- reset globals
    --         resetGlobals()
    --     end)

    --     it("should not update if available balance is not enough", function()
    --         local message = {
    --             Action = "Transfer",
    --             From = "0x123",
    --             Timestamp = "1",
    --             Tags = {
    --                 Recipient = "0x456",
    --                 Quantity = "1001"
    --             }
    --         }

    --         token_lib.transfer(message)

    --         assert(Balances["0x123"], "1000")
    --         assert(Balances["0x456"], "1000")

    --         -- reset globals
    --         resetGlobals()
    --     end)

    --     it("should not update if user has vested amount and tries to send more", function()
    --         local message = {
    --             Action = "Transfer",
    --             From = "0x456",
    --             Timestamp = "50",
    --             Tags = {
    --                 Recipient = "0x123",
    --                 Quantity = "501"
    --             }
    --         }

    --         token_lib.transfer(message)

    --         assert(Balances["0x123"], "1000")
    --         assert(Balances["0x456"], "500")

    --         -- reset globals
    --         resetGlobals()
    --     end)
    -- end)
end)

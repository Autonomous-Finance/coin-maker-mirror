local token_lib = require "token.token_lib"
local json      = require "json"

Variant         = "0.0.5"

-- token should be idempotent and not change previous state updates
Denomination    = Denomination or tonumber(ao.env.Process.Tags["Denomination"])
Balances        = Balances or json.decode(ao.env.Process.Tags["Balances"])
TotalSupply     = TotalSupply or ao.env.Process.Tags["TotalSupply"]
Vesting         = Vesting or json.decode(ao.env.Process.Tags["Vesting"])

Name            = Name or ao.env.Process.Tags["Name"]
Ticker          = Ticker or ao.env.Process.Tags["Ticker"]
Logo            = Logo or ao.env.Process.Tags["Logo"]
InitialSync     = InitialSync or 'INCOMPLETE'

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

--[[
     Batch-Transfer
   ]]
--
Handlers.add('batchTransfer',
    Handlers.utils.hasMatchingTag("Action", "Batch-Transfer"),
    token_lib.batchTransfer
)

if ao.env.Process.Tags["Renounce-Ownership"] == "true" then
    Owner = ''
else
    Owner = ao.env.Process.Tags["Deployer"]
end


if InitialSync == 'INCOMPLETE' then
    local patchMsg = {
        device = 'patch@1.0',
        balances = { device = "trie@1.0" },
        ["token-info"] = {
            ['batch-transfer'] = true,
            denomination = Denomination,
            supply = TotalSupply,
            name = Name,
            ticker = Ticker,
            logo = Logo
        }
    }

    Send(patchMsg)
    -- Updates the flag to prevent the sync from running again.
    InitialSync = 'COMPLETE'
    print("Initial state sync complete. Tokens patched.")
end

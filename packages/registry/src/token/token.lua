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

AllowedRecipients = AllowedRecipients or nil

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

-- Whitelisting handlers just print instead of replying
Handlers.add('addAllowedSender', { Action = "Add-Allowed-Sender" },
    token_lib.addAllowedSender
)

Handlers.add('addAllowedSenderBatch', { Action = "Add-Allowed-Sender-Batch" },
    token_lib.addAllowedSenderBatch
)

Handlers.add('getAllowedSenders', { Action = "Get-Allowed-Senders" },
    token_lib.getAllowedSenders
)

Handlers.add('removeAllowedSender', { Action = "Remove-Allowed-Sender" },
    token_lib.removeAllowedSender
)

Handlers.add('setTransferRestrictions', { Action = "Set-Transfer-Restrictions" },
    token_lib.setTransferRestrictions
)

if ao.env.Process.Tags["Renounce-Ownership"] == "true" then
    Owner = ''
else
    Owner = ao.env.Process.Tags["Deployer"]
end

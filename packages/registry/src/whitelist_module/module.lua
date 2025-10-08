local json = require "json"

local previousWhitelistMod = WhitelistModule

WhitelistModule = {}

-- Initialize state
WhitelistModule.state = {
    Version = "0.2.0",
    Whitelist = previousWhitelistMod and previousWhitelistMod.state.Whitelist or {},
    Enabled = previousWhitelistMod and previousWhitelistMod.state.Enabled or false,
}

-- Helper functions
local function parseBool(str)
    if str == "true" or str == "1" then
        return true
    end
    return false
end

local function assertOwner(msg)
    assert(msg.From == Owner, 'Only the Owner can modify whitelist!')
end

local function addressExists(list, address)
    if not list then return false end
    for _, addr in ipairs(list) do
        if addr == address then
            return true
        end
    end
    return false
end

local handlerExists = function(handlerName)
    if not Handlers or not Handlers.list then return false end
    for _, handler in ipairs(Handlers.list) do
        if handler.name == handlerName then return true end
    end
    return false
end

-- Core whitelist functionality
function WhitelistModule.isWhitelisted(address)
    if not WhitelistModule.state.Enabled then
        return true -- If whitelist is disabled, everyone is allowed
    end
    return addressExists(WhitelistModule.state.Whitelist, address)
end

-- Handlers
function WhitelistModule.addAddress(msg)
    assertOwner(msg)
    assert(type(msg.Tags.Address) == 'string', 'Address is required!')

    if not WhitelistModule.state.Enabled then
        WhitelistModule.state.Enabled = true
    end

    if not addressExists(WhitelistModule.state.Whitelist, msg.Tags.Address) then
        table.insert(WhitelistModule.state.Whitelist, msg.Tags.Address)

        local patchMsg = {
            device = 'patch@1.0',
            ['token-info'] = {
                ['whitelist-module'] = true,
                whitelist = {
                    enabled = WhitelistModule.state.Enabled,
                    addresses = WhitelistModule.state.Whitelist
                }
            }
        }

        Send(patchMsg)

        return msg.reply({
            Action = "Whitelist/Add-Address/Response",
            Address = msg.Tags.Address
        })
    else
        return msg.reply({
            Action = "Whitelist/Add-Address/Response",
            Error = "Address already exists",
            Address = msg.Tags.Address
        })
    end
end

function WhitelistModule.addAddressBatch(msg)
    assertOwner(msg)
    assert(type(msg.Tags.Addresses) == 'string', 'Addresses JSON is required!')

    local addresses = json.decode(msg.Tags.Addresses)
    assert(type(addresses) == 'table', 'Addresses must be a valid JSON array!')

    if not WhitelistModule.state.Enabled then
        WhitelistModule.state.Enabled = true
    end

    local added = {}
    local existing = {}

    for _, addr in ipairs(addresses) do
        if not addressExists(WhitelistModule.state.Whitelist, addr) then
            table.insert(WhitelistModule.state.Whitelist, addr)
            table.insert(added, addr)
        else
            table.insert(existing, addr)
        end
    end

    local patchMsg = {
        device = 'patch@1.0',
        ['token-info'] = {
            ['whitelist-module'] = true,
            whitelist = {
                enabled = WhitelistModule.state.Enabled,
                addresses = WhitelistModule.state.Whitelist
            }
        }
    }

    Send(patchMsg)

    return msg.reply({
        Action = "Whitelist/Add-Address-Batch/Response",
        Data = json.encode({
            Added = added,
            Existing = existing
        })
    })
end

function WhitelistModule.removeAddress(msg)
    assertOwner(msg)
    assert(type(msg.Tags.Address) == 'string', 'Address is required!')

    for i, addr in ipairs(WhitelistModule.state.Whitelist) do
        if addr == msg.Tags.Address then
            table.remove(WhitelistModule.state.Whitelist, i)

            return msg.reply({
                Action = "Whitelist/Remove-Address/Response",
                Address = msg.Tags.Address
            })
        end
    end

    local patchMsg = {
        device = 'patch@1.0',
        ['token-info'] = {
            ['whitelist-module'] = true,
            whitelist = {
                enabled = WhitelistModule.state.Enabled,
                addresses = WhitelistModule.state.Whitelist
            }
        }
    }

    Send(patchMsg)

    return msg.reply({
        Action = "Whitelist/Remove-Address/Response",
        Error = "Address not found",
        Address = msg.Tags.Address
    })
end

function WhitelistModule.getWhitelist(msg)
    return msg.reply({
        Action = "Whitelist/Get-Whitelist/Response",
        Data = json.encode({
            Whitelist = WhitelistModule.state.Whitelist,
            Enabled = WhitelistModule.state.Enabled,
            Version = WhitelistModule.state.Version
        })
    })
end

function WhitelistModule.setEnabled(msg)
    assertOwner(msg)
    assert(msg.Tags.Enabled ~= nil, 'Enabled flag is required!')

    local enabled = parseBool(msg.Tags.Enabled)
    WhitelistModule.state.Enabled = enabled

    local patchMsg = {
        device = 'patch@1.0',
        ['token-info'] = {
            ['whitelist-module'] = true,
            whitelist = {
                enabled = WhitelistModule.state.Enabled,
                addresses = WhitelistModule.state.Whitelist
            }
        }
    }

    Send(patchMsg)

    return msg.reply({
        Action = "Whitelist/Set-Enabled/Response",
        Enabled = enabled
    })
end

-- Initialize the module
function WhitelistModule.init()
    -- remove legacy handlers (v 0.1.0)
    Handlers.remove('addAllowedSender')
    Handlers.remove('addAllowedSenderBatch')
    Handlers.remove('getAllowedSenders')
    Handlers.remove('removeAllowedSender')
    Handlers.remove('setTransferRestrictions')

    -- Register handlers
    Handlers.add('Whitelist/Add-Address',
        function(msg)
            return msg.Action == "Whitelist/Add-Address" or msg.Action == "Add-Allowed-Sender"
        end,
        WhitelistModule.addAddress
    )

    Handlers.add('Whitelist/Add-Address-Batch',
        function(msg)
            return msg.Action == "Whitelist/Add-Address-Batch" or msg.Action == "Add-Allowed-Sender-Batch"
        end,
        WhitelistModule.addAddressBatch
    )

    Handlers.add('Whitelist/Remove-Address',
        function(msg)
            return msg.Action == "Whitelist/Remove-Address" or msg.Action == "Remove-Allowed-Sender"
        end,
        WhitelistModule.removeAddress
    )

    Handlers.add('Whitelist/Get-Whitelist',
        function(msg)
            return msg.Action == "Whitelist/Get-Whitelist" or msg.Action == "Get-Allowed-Senders"
        end,
        WhitelistModule.getWhitelist
    )

    Handlers.add('Whitelist/Set-Enabled',
        function(msg)
            return msg.Action == "Whitelist/Set-Enabled" or msg.Action == "Set-Transfer-Restrictions"
        end,
        WhitelistModule.setEnabled
    )

    -- Insert Guard handler before Transfer

    -- 1. ensure we don't duplicate
    while handlerExists('Whitelist/Transfer-Guard') do
        Handlers.remove('Whitelist/Transfer-Guard')
    end
    -- 2. add handler
    Handlers.before("transfer").add("Whitelist/Transfer-Guard",
        function(msg)
            if msg.Tags.Action ~= "Transfer" then
                return "continue"
            end

            local pass = true

            if WhitelistModule.state.Enabled and not WhitelistModule.isWhitelisted(msg.From) then
                msg.reply({
                    Action = "Transfer-Error",
                    Error = "Sender is not whitelisted"
                })
                pass = false
            end


            if not pass then
                return "break"
            else
                return "continue"
            end
        end,
        function(msg)
            -- nothing to do, the relevant logic is in the matching fn
        end
    )

    -- Insert Guard handler before Transfer
    -- 1. ensure we don't duplicate
    while handlerExists('Whitelist/Batch-Transfer-Guard') do
        Handlers.remove('Whitelist/Batch-Transfer-Guard')
    end
    -- 2. add handler
    Handlers.before("batchTransfer").add("Whitelist/Batch-Transfer-Guard",
        function(msg)
            if msg.Tags.Action ~= "Batch-Transfer" then
                return "continue"
            end

            local pass = true

            if WhitelistModule.state.Enabled and not WhitelistModule.isWhitelisted(msg.From) then
                msg.reply({
                    Action = "Batch-Transfer-Error",
                    Error = "Sender is not whitelisted"
                })
                pass = false
            end


            if not pass then
                return "break"
            else
                return "continue"
            end
        end,
        function(msg)
            -- nothing to do, the relevant logic is in the matching fn
        end
    )
end

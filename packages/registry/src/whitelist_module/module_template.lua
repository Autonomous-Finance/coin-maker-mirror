MODULE_TEMPLATE = [===[
do
local _ENV = _ENV
package.preload[ "whitelist_module.module" ] = function( ... ) local arg = _G.arg;
local json = require "json"

WhitelistModule = {}

-- Initialize state
WhitelistModule.state = {
    Version = "0.1.0",
    Whitelist = {},
    Enabled = false,
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
            Enabled = WhitelistModule.state.Enabled
        })
    })
end

function WhitelistModule.setEnabled(msg)
    assertOwner(msg)
    assert(msg.Tags.Enabled ~= nil, 'Enabled flag is required!')

    local enabled = parseBool(msg.Tags.Enabled)
    WhitelistModule.state.Enabled = enabled

    return msg.reply({
        Action = "Whitelist/Set-Enabled/Response",
        Enabled = enabled
    })
end

-- Initialize the module
function WhitelistModule.init(initialAddresses, initialEnabled)
    WhitelistModule.state.Whitelist = initialAddresses or {}
    WhitelistModule.state.Enabled = parseBool(initialEnabled) or false

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
    Handlers.before("transfer").add("Whitelist/Transfer-Guard",
        function(msg)
            return msg.Action == "Transfer"
        end,
        function(msg)
            if WhitelistModule.state.Enabled then
                if not WhitelistModule.isWhitelisted(msg.From) then
                    msg.reply({
                        Action = "Transfer-Error",
                        Error = "Sender is not whitelisted"
                    })
                    return "break"
                end
            end

            return "continue"
        end
    )
end
end
end

local json = require "json"

WhitelistModule = {}

-- Initialize state
WhitelistModule.state = {
    Version = "0.1.0",
    Whitelist = {},
    Enabled = false,
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
            Enabled = WhitelistModule.state.Enabled
        })
    })
end

function WhitelistModule.setEnabled(msg)
    assertOwner(msg)
    assert(msg.Tags.Enabled ~= nil, 'Enabled flag is required!')

    local enabled = parseBool(msg.Tags.Enabled)
    WhitelistModule.state.Enabled = enabled

    return msg.reply({
        Action = "Whitelist/Set-Enabled/Response",
        Enabled = enabled
    })
end

-- Initialize the module
function WhitelistModule.init(initialAddresses, initialEnabled)
    WhitelistModule.state.Whitelist = initialAddresses or {}
    WhitelistModule.state.Enabled = parseBool(initialEnabled) or false

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
    Handlers.before("transfer").add("Whitelist/Transfer-Guard",
        function(msg)
            return msg.Action == "Transfer"
        end,
        function(msg)
            if WhitelistModule.state.Enabled then
                if not WhitelistModule.isWhitelisted(msg.From) then
                    msg.reply({
                        Action = "Transfer-Error",
                        Error = "Sender is not whitelisted"
                    })
                    return "break"
                end
            end

            return "continue"
        end
    )
end
]===]

return MODULE_TEMPLATE

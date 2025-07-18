-- Helper to parse "true"/"false" from string
local function parseBool(str)
    if str == "true" or str == "1" then
        return true
    end
    return false
end

local function assertOwner(msg)
    assert(msg.From == Owner, 'Only the Owner can modify allowed recipients!')
end

-- Check if a recipient address exists in a list
local function recipientExists(list, recipient)
    if not list then return false end
    for _, address in ipairs(list) do
        if address == recipient then
            return true
        end
    end
    return false
end

-- Check if transferring to a recipient is allowed
local function _transferAllowed(recipient)
    if AllowedRecipients ~= nil then
        return recipientExists(AllowedRecipients, recipient)
    end
    return true
end

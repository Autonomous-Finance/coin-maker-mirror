local template = require "whitelist_module.module_template"

Handlers.add("Install", {Action = "Install"}, function(msg)
    local initialAddresses = msg.Tags["Initial-Addresses"] or nil
    local initialEnabled = msg.Tags["Enabled"] == "true" or false

    local install_script = string.format([[
        -- Module Source Code:
        -- --------------------------------------------------
        %s
        WhitelistModule.init(initialAddresses, initialEnabled)
    ]], template, initialAddresses, initialEnabled)

    msg.reply({
        Action = "Install-Response",
        Data = install_script
    })
end)

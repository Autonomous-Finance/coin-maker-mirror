local template = require "whitelist_module.module_template"

Handlers.add("Install", { Action = "Install" }, function(msg)
    local install_script = string.format([[
        -- Module Source Code:
        -- --------------------------------------------------
        %s
        WhitelistModule.init()
    ]], template)

    msg.reply({
        Action = "Install-Response",
        Data = install_script
    })
end)

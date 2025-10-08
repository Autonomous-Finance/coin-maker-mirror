local json = require("json")

TOKENDROP_PROCESS = ao.env.Process.Tags['TokenDrop-Process'] or "mQES2_hwlXQS8JVSdPJvRTkp78slLCl2gpm6sW3CK9w"

Handlers.add("Overview/Patch-Tokens", { Action = "Overview/Patch-Tokens" }, function(msg)
    assert(msg.From == TOKENDROP_PROCESS, "Overview/Patch-Tokens: Invalid sender")

    ao.send({
        device = "patch@1.0",
        tokens = json.decode(msg.Data)
    })
end)

Handlers.add("Overview/Patch-Token", { Action = "Overview/Patch-Token" }, function(msg)
    assert(msg.From == TOKENDROP_PROCESS, "Overview/Patch-Tokens: Invalid sender")

    local tokenProcess = msg.Tags["Token-Process"]

    ao.send({
        device = "patch@1.0",
        tokens = {
            [tokenProcess] = msg.Data -- already comes json encoded
        }
    })
end)
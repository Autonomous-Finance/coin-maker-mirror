Handlers.add("evalConfirmation",
    { Action = "Eval-Confirmation" },
    function(msg)
        print("Eval confirmation received for process: " .. msg.From)
    end
)

Handlers.add("spawnd", { Action = "Spawn-Proc" }, function(msg)
    print("Spawning process")
    local evalConfirmation = [[
        ao.send({
        Target = ']] .. ao.id .. [[',
        Action = 'Eval-Confirmation',
        })
    ]]

    local ss = ao.spawn('ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s', {
        Data = evalConfirmation,
        Tags = {
            device = "process@1.0",
            ["execution-device"] = "genesis-wasm@1.0",
            ["push-device"] = "push@1.0",
            scheduler = "PsvpJeZSiCJck-PRlgkN4KL6jgUKbR3YiHu0X6I43kU",
            ["scheduler-device"] = "scheduler@1.0",
            ["scheduler-location"] = "PsvpJeZSiCJck-PRlgkN4KL6jgUKbR3YiHu0X6I43kU",
        }
    })

    print("Spawned process: ")
    print(ss)
end)

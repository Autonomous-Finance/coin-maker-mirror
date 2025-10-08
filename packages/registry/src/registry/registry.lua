local json = require "json"
local template = require "token.token_as_template"

local mod = {}

function mod.getTokensList(msg)
    local replyData = Tokens
    mod.sendReply(msg, replyData)

    return Tokens
end

function mod.getTokensByDeployer(msg)
    local tokens = {}

    local from = msg.Tags.Deployer or msg.From

    for _, token in ipairs(Tokens) do
        if token.Deployer == from then
            table.insert(tokens, token)
        end
    end

    local replyData = tokens
    mod.sendReply(msg, replyData)

    return tokens
end

function mod.getTokenByProcess(msg)
    assert(msg.Tags.TokenProcess, "Token process is required")

    local token = {}

    for _, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags.TokenProcess then
            token = t
            break
        end
    end

    local replyData = token
    mod.sendReply(msg, replyData)
end

function mod.getTokenPools(msg)
    assert(msg.Tags["Token-Process"], "Token process is required")

    local pools = {}

    for _, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags["Token-Process"] then
            pools = t.LPs
            break
        end
    end

    local replyData = pools
    mod.sendReply(msg, replyData)

    return pools
end

function mod.addToken(msg)
    assert(msg.Tags.Name, "Token name is required")
    assert(msg.Tags.Ticker, "Token ticker is required")
    assert(msg.Tags.Balances, "Token balances are required")
    assert(msg.Tags.TotalSupply, "Token total supply is required")
    assert(msg.Tags.Denomination, "Token denomination is required")
    assert(msg.Tags.Description, "Token description is required")
    assert(msg.Tags.Telegram, "Token telegram is required")
    assert(msg.Tags.Twitter, "Token twitter is required")
    assert(msg.Tags.Website, "Token website is required")
    assert(msg.Tags.Logo, "Token logo is required")

    -- Generate internal id for the token to track spawn process
    local InternalId = msg.Id

    local isRenounced = msg.Tags.RenounceOwnership or false

    if isRenounced == "true"
    then
        isRenounced = true
    else
        isRenounced = false
    end

    local token = {
        InternalId = InternalId,
        Deployer = msg.From,
        Name = msg.Tags.Name,
        Ticker = msg.Tags.Ticker,
        Denomination = tonumber(msg.Tags.Denomination),
        Description = msg.Tags.Description,
        Balances = json.decode(msg.Tags.Balances),
        TotalSupply = msg.Tags.TotalSupply,
        Logo = msg.Tags.Logo,
        Status = TokenStatus.PendingSpawn,
        LPs = {},
        RenounceOwnership = isRenounced,
        CoverImage = "",
        SocialLinks = {
            Telegram = msg.Tags.Telegram,
            Twitter = msg.Tags.Twitter,
            Website = msg.Tags.Website
        }
    }

    -- Spawn process
    local processId = mod.spawnTokenProcess(token, InternalId)

    token.Status = TokenStatus.Deployed

    ao.send({
        Target = ao.id,
        Action = "LOG-INSERT-TOKEN",
        Time = tostring(msg.Timestamp),
    })

    -- Save token details to table
    token.TokenProcess = processId
    table.insert(Tokens, token)

    local tokenIndex = #Tokens

    ao.send({
        Target = ao.id,
        Action = "LOG-INSERTED-TOKEN",
        Time = tostring(msg.Timestamp),
        ["Token-Index"] = tostring(tokenIndex),
    })

    local replyData = token

    mod.sendReply(msg, replyData)

    -- patch single token
    mod.patchSingleToken(token.TokenProcess, token)
    -- Also call patch tokens list
    mod.patchTokensList()

    return token
end

function mod.spawnTokenProcess(token, internalId)
    ao.send({
        Target = ao.id,
        Action = "LOG-SPAWN-INITIATE-WITH-BLUEPRINT",
        Ticker = token.Ticker,
    })

    -- Format balances and vesting table
    local bt = {}
    local vt = {}

    for key, value in pairs(token.Balances) do
        bt[key] = value.Amount
        vt[key] = { Amount = value.Amount, Until = value.Vesting }
    end

    -- Generate tags for spawn process
    local tags = {
        Name = token.Name,
        Ticker = token.Ticker,
        Logo = token.Logo,
        Denomination = tostring(token.Denomination),
        TotalSupply = token.TotalSupply,
        Vesting = json.encode(vt),
        Balances = json.encode(bt),
        Deployer = token.Deployer,
        ["Spawn-Token-Process"] = internalId,
        Authority = 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
        ["On-Boot"] = "Data"
    }
    --[[         ["Execution-Device"] = "genesis-wasm@1.0",
        ["Scheduler-Device"] = "scheduler@1.0",
        Device = "process@1.0", ]]

    if (token.RenounceOwnership == true)
    then
        tags["Renounce-Ownership"] = "true"
    end

    -- Spawn process
    local evalConfirmation = [[
        ao.send({
        Target = ']] .. ao.id .. [[',
        Action = 'Eval-Confirmation',
        })
    ]]

    local spawnSuccessMsg = ao.spawn('Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM', {
        Data = template .. evalConfirmation,
        Tags = tags
    }).receive()

    -- this confirms that the BOOTLOAD eval HAS RUN
    ao.send({
        Target = ao.id,
        Action = "LOG-SPAWNED-PROCESS",
        Ticker = token.Ticker,
        ["Process-Id"] = spawnSuccessMsg.Tags["Process"],
    })

    local processId = spawnSuccessMsg.Tags["Process"]

    Receive(function(m)
        return m.Tags['From-Process'] == processId
            and m.Tags.Action == "Eval-Confirmation"
    end)

    -- this confirms that the BOOTLOAD eval RAN WITHOUT ERRORS
    -- in case we need it for the frontend
    ao.send({
        Target = ao.id,
        Action = "LOG-DEPLOYED-BLUEPRINT",
        Ticker = token.Ticker,
        ["Process-Id"] = processId,
    })

    return processId
end

function mod.getTokenByInternalId(msg)
    assert(msg.Tags.InternalId, "InternalId is required")

    for _, token in ipairs(Tokens) do
        if token.InternalId == msg.Tags.InternalId then
            local replyData = token
            local replyTags = { ["Token-Process"] = token.TokenProcess }
            mod.sendReply(msg, replyData, replyTags)
            return token
        end
    end

    return false
end

function mod.addTokenPool(msg)
    assert(msg.Tags["Token-Process"], "Token process is required")
    assert(msg.Tags["LP-Process"], "LP process is required")

    for index, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags["Token-Process"] and t.Deployer == msg.From then
            local existingLPs = t["LPs"] or {}

            -- check if LP already exists
            for _, lp in ipairs(existingLPs) do
                if lp == msg.Tags["LP-Process"] then
                    return false
                end
            end

            table.insert(Tokens[index]["LPs"], msg.Tags["LP-Process"])

            mod.sendReply(msg, Tokens[index])

            -- patch single token
            mod.patchSingleToken(t.TokenProcess, Tokens[index])

            -- Also call patch tokens list
            mod.patchTokensList()
            return true
        end
    end

    return false
end

function mod.sendReply(msg, data, tags)
    msg.reply({
        Action = msg.Tags.Action .. "-Response",
        Tags = tags,
        Data = json.encode(data)
    })
end

function mod.updateTokenProfile(msg)
    assert(msg.Tags["Token-Process"], "Token process is required")
    assert(msg.From == AMMMonitor, "Only AMM Monitor can update token profile")

    local existingToken = false

    local details = json.decode(msg.Data)
    -- Validate Logo
    assert(type(details.Logo) == "string", "Logo must be a string")
    if #details.Logo > 0 then
        assert(string.len(details.Logo) == 43, "Logo must be a valid Arweave transaction ID")
    end

    -- Validate CoverImage
    assert(type(details.CoverImage) == "string", "CoverImage must be a string")
    if #details.CoverImage > 0 then
        assert(string.len(details.CoverImage) == 43, "CoverImage must be a valid Arweave transaction ID")
    end

    -- Validate Description
    assert(type(details.Description) == "string", "Description must be a string")
    assert(string.len(details.Description) <= 1000, "Description must not exceed 1000 characters")

    -- Validate SocialLinks
    assert(type(details.SocialLinks) == "table", "SocialLinks must be a table")
    for _, link in ipairs(details.SocialLinks) do
        assert(type(link.key) == "string", "SocialLinks keys must be strings")
        assert(type(link.value) == "string", "SocialLinks values must be strings")
        if #link.value > 0 then
            assert(string.match(link.value, "^https?://"), "SocialLinks values must be valid URLs")
        end
    end

    for index, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags["Token-Process"] then
            existingToken = true
            assert(t.Deployer == msg.Tags.Sender, "Only token deployer can update token profile")

            Tokens[index].Logo = details.Logo
            Tokens[index].CoverImage = details.CoverImage
            Tokens[index].Description = details.Description
            Tokens[index].SocialLinks = details.SocialLinks

            local replyData = Tokens[index]
            mod.sendReply(msg, replyData)

            -- extra notification to payment sender
            ao.send({
                Target = msg.Tags.Sender,
                Action = "Token-Profile-Updated",
                Tags = { ["Token-Process"] = msg.Tags["Token-Process"] },
            })

            -- patch single token
            mod.patchSingleToken(t.TokenProcess, Tokens[index])

            -- Also call patch tokens list
            mod.patchTokensList()
            return true
        end
    end

    if existingToken == false then
        local tokenDetails = ao.send({
            Target = msg.Tags['Token-Process'],
            Tags = {
                Action = "Info",
            }
        }).receive()

        local totalSupply = ao.send({
            Target = msg.Tags['Token-Process'],
            Tags = {
                Action = "Total-Supply",
            }
        }).receive()

        local token = {
            InternalId = msg.Id,
            TokenProcess = msg.Tags['Token-Process'],
            Deployer = tokenDetails.Tags['Owner'],
            Name = tokenDetails.Tags['Name'],
            Ticker = tokenDetails.Tags['Ticker'],
            Denomination = tonumber(tokenDetails.Tags['Denomination']),
            Description = details.Description,
            Balances = {},
            TotalSupply = totalSupply.Data,
            Logo = details.Logo,
            Status = 'EXTERNAL',
            LPs = {},
            RenounceOwnership = false,
            CoverImage = details.CoverImage,
            SocialLinks = details.SocialLinks
        }

        table.insert(Tokens, token)

        mod.sendReply(msg, token)

        -- extra notification to payment sender
        ao.send({
            Target = msg.Tags.Sender,
            Action = "Token-Profile-Updated",
            Tags = { ["Token-Process"] = msg.Tags["Token-Process"] },
        })

        -- patch single token
        mod.patchSingleToken(token.TokenProcess, token)

        -- Also call patch tokens list
        mod.patchTokensList()
        return true
    end

    return false
end

function mod.renounceOwnership(msg)
    assert(msg.Tags["Token-Process"], "Token process is required")

    for index, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags["Token-Process"] then
            local isDeployer = t.Deployer == msg.From
            -- local hasMoreThan50PercentBalance = t.Balances[msg.From] and t.Balances[msg.From].Amount > t.TotalSupply / 2
            local canUpdate = isDeployer -- or hasMoreThan50PercentBalance

            assert(canUpdate, "Only token deployer can renounce ownership")

            Tokens[index].RenounceOwnership = true

            ao.send({
                Target = msg.Tags["Token-Process"],
                Tags = {
                    Action = "Eval",
                },
                Data = "Owner = ''"
            })

            local replyData = Tokens[index]
            mod.sendReply(msg, replyData)

            -- patch single token
            mod.patchSingleToken(t.TokenProcess, Tokens[index])

            -- Also call patch tokens list
            mod.patchTokensList()

            return true
        end
    end

    return false
end

function mod.clearRegistryTokens(msg)
    -- Check if msg.From is equal to Owner
    assert(msg.From == Owner or msg.From == ao.id, "Only owner can call")

    Tokens = {}

    -- Also call patch tokens list
    mod.patchTokensList()
end

function mod.removeToken(msg)
    assert(msg.From == Owner or msg.From == ao.id, "Only owner can call")
    assert(msg.Tags["Token-Process"], "Token process is required")

    for index, t in ipairs(Tokens) do
        if t.TokenProcess == msg.Tags["Token-Process"] then
            table.remove(Tokens, index)

            -- patch single token
            mod.patchSingleToken(t.TokenProcess, nil)

            -- Also call patch tokens list
            mod.patchTokensList()

            return true
        end
    end

    return false
end

function mod.patchTokensList()
    local cleanTokens = {}
    for _, tok in ipairs(Tokens) do
        local key = tok.TokenProcess
        if key then
            -- build a shallow copy without “Status”
            local copy = {}
            for k, v in pairs(tok) do
                if k ~= "Status" then
                    copy[k] = v
                end
            end

            cleanTokens[key] = json.encode(copy)
        end
    end

    ao.send({
        device = 'patch@1.0',
        cache = {
            tokens = cleanTokens,
        }
    })
end

function mod.patchSingleToken(tokenProcess, data)
    -- Create a shallow clone of the token without the Status field
    local cleanData = {}
    if data then
        -- build a shallow copy without “Status”
        local copy = {}
        for k, v in pairs(data) do
            if k ~= "Status" then
                copy[k] = v
            end
        end

        cleanData = copy
    end

    local patchMsg = {
        device = 'patch@1.0',
        cache = {
            tokens = {}
        }
    }

    patchMsg.cache.tokens[tokenProcess] = cleanData

    ao.send(patchMsg)
end

return mod

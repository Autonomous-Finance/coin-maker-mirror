local registry = require("registry.registry")
local json = require("json")

OPERATOR = OPERATOR or ao.env.Process.Tags.Operator
Tokens = Tokens or {}
Module = "SBNb1qPQ1TDwpD_mboxm2YllmMLXpWw4U8P9Ff8W9vk"
AMMMonitor = AMMMonitor or nil
Initialized = Initialized or false
HB_CACHE_PROCESS = HB_CACHE_PROCESS or ao.env.Process.Tags["HB-Cache-Process"] or "8EPFHQHsxVlHocvcxAaBbxCrmzzg7AsG2Cl0QLnSIG4"

TokenStatus = {
	PendingSpawn = "PENDING_SPAWN",
	Spawned = "SPAWNED_PROCESS",
	Deployed = "DEPLOYED",
}

Handlers.add("Initialize", Handlers.utils.hasMatchingTag("Action", "Initialize"), function(msg)
	if msg.From ~= OPERATOR then
		error("Unauthorized")
	end

	assert(msg.Tags.DexiProcess, "DexiProcess is required for Dexi initialization")

	AMMMonitor = msg.Tags.DexiProcess

	Initialized = true
	ao.send({
		Target = ao.id,
		Event = "Initialized",
	})
end)

Handlers.add("isInitialized", Handlers.utils.hasMatchingTag("Action", "Is-Initialized"), function(msg)
	return msg.reply({
		Target = msg.From,
		Tags = {
			["Response-For"] = msg.Action,
			Initialized = Initialized,
		},
	})
end)
Handlers.add("tokens", Handlers.utils.hasMatchingTag("Action", "Tokens"), registry.getTokensList)

Handlers.add(
	"tokensByDeployer",
	Handlers.utils.hasMatchingTag("Action", "Tokens-By-Deployer"),
	registry.getTokensByDeployer
)

Handlers.add("tokenByProcess", Handlers.utils.hasMatchingTag("Action", "Token-By-Process"), registry.getTokenByProcess)

Handlers.add("addToken", Handlers.utils.hasMatchingTag("Action", "Add-Token"), registry.addToken)

-- Handler to query TokenProcess by InternalId (initial message id)
Handlers.add(
	"queryTokenProcess",
	Handlers.utils.hasMatchingTag("Action", "Query-Token-Process"),
	registry.getTokenByInternalId
)

-- Handler to renounce ownership of token
Handlers.add(
	"renounceOwnership",
	Handlers.utils.hasMatchingTag("Action", "Renounce-Ownership"),
	registry.renounceOwnership
)

-- Handler to spawn AMM for token
Handlers.add("addPool", Handlers.utils.hasMatchingTag("Action", "Add-Pool"), registry.addTokenPool)

-- Handler to get token LPs
Handlers.add("getPools", Handlers.utils.hasMatchingTag("Action", "Get-Token-Pools"), registry.getTokenPools)

-- Handler to update token profile
Handlers.add(
	"updateTokenProfile",
	Handlers.utils.hasMatchingTag("Action", "Update-Token-Profile"),
	registry.updateTokenProfile
)

-- Handler to clear all tokens
Handlers.add(
	"clearTokensFromRegistry",
	Handlers.utils.hasMatchingTag("Action", "Clear-Registry-Tokens"),
	registry.clearRegistryTokens
)

-- Handler to remove token from registry
Handlers.add("removeToken", Handlers.utils.hasMatchingTag("Action", "Remove-Token"), registry.removeToken)


-- Handler to manually patch the tokens list
Handlers.add("manual-patch-tokens", { Action = "Manual-Patch-Tokens" }, function(msg)
	if msg.From ~= OPERATOR and msg.From ~= "yqRGaljOLb2IvKkYVa87Wdcc8m_4w6FI58Gej05gorA" then
		error("Unauthorized")
	end

	registry.patchTokensList()
end)

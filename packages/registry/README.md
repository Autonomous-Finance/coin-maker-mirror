# TokenRegistry

## Build
Build script takes `blueprint.lua`, `generate_template.lua`, `registry.lua` and combines them into one file `dist/output.lua`

```bash
bun install

bun run build
```

## Handlers.list
- Tokens
- TokensByDeployer
- TokenByProcess
- AddToken


- Spawned

### Tokens

This handler returns `json` encoded `Tokens` table.

#### Flow
```
User -> TokenRegistry -> User
```

#### Usage

```lua
Send({
    Target = ao.id,
    Action = "Tokens"
})
```

### TokensByDeployer
This handler returns `json` encoded `Tokens` table with the `Deployer` Key = `msg.Tags.Deployer` or `msg.From`

#### Flow
```
User -> TokenRegistry -> User
```

#### Usage
```lua
Send({ 
    Target = ao.id, 
    Action = "TokensByDeployer",
    Deployer = "deployer_address"
})

Send({ 
    Target = ao.id,
    Action = "TokensByDeployer"
})
```

### TokenByProcess
This handler returns `json` encoded `Token` that matches `TokenProcess` = `msg.Tags.TokenProcess`

#### Tags
```
TokenProcess = string
```

#### Flow
```
User -> TokenRegistry -> User
```

#### Usage

```lua
Send({
    Target = ao.id,
    Action = "TokenByProcess",
    TokenProcess = "process_id"
})
```

### AddToken
This handler validates input tags, generates an `InternalId`, spawns a new ao process and saves the `Token` details to `Tokens` table. Also returns a new message to the sender.

`InternalId` is an md5 string generated from all the `msg.Tags` table.

```local InternalId = crypto.digest.md5(table.concat(msg.Tags, "-"))```

#### Tags

```
Balances = String of Key-Value Object
Name = String
TotalSupply = String
Ticker = String
Denomination = String
Description = String
Telegram = String
Twitter = String
Website = String
Logo = String
```

#### Flow
```
User -> TokenRegistry -> Spawn Process -> User
```

#### Spawned Process
```
Tags = {
    Name = "AF-TokenDrop-Token",
    Ticker = msg.Tags.Ticker,
    Deployer = msg.From,
    SpawnTokenProcess = InternalId
}
```

#### Usage

```
Send({
    Target = ao.id,
    Action = "AddToken"
})
```

### Spawned
Spawned handler is an internal use handler that gets a response from AO once the Token Process is spawned. This handler updates Token.Status to "Spawned" and TokenProcess to process id that has been spawned.

Handler checks that the sender is the TokenRegistry process.

### DeployTokenCron
This handler is a cron message consumer that will get each `Tokens` with `Status = Spawned`, generates the blueprint and then loads the blueprint into the token process. It sends a message to the `Token.Deployer` to announce the success.
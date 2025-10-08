local result = ao.send({
  Target = "Zd7vLelhAEU0EBEZ5yszRC1n3V9Win4U-7mcprtSZvs",
  Action = "Install"
}).receive()

load(result.Data)()

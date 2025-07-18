#!/bin/bash

set -e

# Create build directory if it doesn't exist
mkdir -p ./build

cd src

# Build token template
amalg.lua -s token/token.lua -o ../build/token.lua \
  token.token_lib

echo "Token process built"

# Build whitelist module
amalg.lua -s whitelist_module/module.lua -o ../build/whitelist_module.lua \
  whitelist_module.module

echo "Whitelist module built"

cd ..

# Create template file
{
  echo 'TOKEN_BLUEPRINT = [===['
  cat build/token.lua
  echo ']===] 

return TOKEN_BLUEPRINT'
} > src/token/token_as_template.lua

echo "Token template created"

# Create template file for whitelist module
{
  echo 'MODULE_TEMPLATE = [===['
  cat build/whitelist_module.lua
  echo ']===] 

return MODULE_TEMPLATE'
} > src/whitelist_module/module_template.lua
echo "Whitelist module template created"

cd src

# Build whitelist process
amalg.lua -s whitelist_module/process.lua -o ../build/whitelist_process.lua \
  whitelist_module.module_template

# Build factory
amalg.lua -s process.lua -o ../build/registry.lua \
  registry.registry \
  token.token_as_template

echo "Factory built"
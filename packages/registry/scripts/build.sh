#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p ./build

cd src

# Build token template
amalg.lua -s token/token.lua -o ../build/token.lua \
  token.token_lib

echo "Token process built"

cd ..

# Create template file
{
  echo 'TOKEN_BLUEPRINT = [===['
  cat build/token.lua
  echo ']===] 

return TOKEN_BLUEPRINT'
} > src/token/token_as_template.lua

echo "Token template created"

cd src

# Build factory
amalg.lua -s process.lua -o ../build/registry.lua \
  registry.registry \
  token.token_as_template

echo "Factory built"
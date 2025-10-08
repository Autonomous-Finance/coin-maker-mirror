#!/usr/bin/env bash
# format_hb_response.sh
#
#  cat response.json | ./format_hb_response.sh
#  ./format_hb_response.sh response.json
#
# Dependencies: jq  (https://stedolan.github.io/jq)

set -euo pipefail

# ───────────────────────── helpers ──────────────────────────

# Remove ANSI colour/format sequences
strip_ansi() {
  # ESC is \x1B; keep the $'' quoting so \x1B is interpreted
  sed -r $'s/\x1B\\[[0-9;]*[mK]//g'
}

# Convert “Key = "value",”  →  "Key": "value",
kv_to_json() {
  sed -E 's/^([[:space:]]*)([A-Za-z0-9_-]+)[[:space:]]*=[[:space:]]*/\1"\2": /'
}

# Pretty-print the payload found under .data
pretty_data() {
  printf '%b' "$1"        |   # decode \n etc.
  strip_ansi              |   # wipe colour codes
  kv_to_json              |   # make it JSON-like
  jq .                    # and pretty-print
}

# ─────────────────────────  main  ───────────────────────────

INPUT=${1:-/dev/stdin}
RAW_JSON=$(cat "$INPUT")

# 1) .data section
DATA=$(jq -r '.data'   <<<"$RAW_JSON")
echo -e "### data\n"
pretty_data "$DATA" || echo "(could not parse .data)"

# 2) any embedded error message
ERROR=$(jq -r '.json.body? // empty' <<<"$RAW_JSON" \
        | jq -r '.Error? // empty' 2>/dev/null || true)

if [[ -n "$ERROR" ]]; then
  echo -e "\n### error\n"
  printf '%b\n' "$ERROR" | strip_ansi
fi


#!/bin/bash
# Custom Claude Code statusline - Created: 2025-12-24T08:30:00.000Z
# Theme: detailed | Colors: true | Features: directory, git, model, context, usage, tokens, burnrate
STATUSLINE_VERSION="1.4.0"

input=$(cat)

# ---- check jq availability ----
HAS_JQ=0
if command -v jq >/dev/null 2>&1; then
  HAS_JQ=1
fi

# Get the directory where this statusline script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/statusline.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ---- logging ----
{
  echo "[$TIMESTAMP] Status line triggered (cc-statusline v${STATUSLINE_VERSION})"
  echo "[$TIMESTAMP] Input:"
  if [ "$HAS_JQ" -eq 1 ]; then
    echo "$input" | jq . 2>/dev/null || echo "$input"
    echo "[$TIMESTAMP] Using jq for JSON parsing"
  else
    echo "$input"
    echo "[$TIMESTAMP] WARNING: jq not found, using bash fallback for JSON parsing"
  fi
  echo "---"
} >> "$LOG_FILE" 2>/dev/null

# ---- color helpers (force colors for Claude Code) ----
use_color=1
[ -n "$NO_COLOR" ] && use_color=0

C() { if [ "$use_color" -eq 1 ]; then printf '\033[%sm' "$1"; fi; }
RST() { if [ "$use_color" -eq 1 ]; then printf '\033[0m'; fi; }

# ---- modern sleek colors ----
dir_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;117m'; fi; }    # sky blue
model_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;147m'; fi; }  # light purple
version_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;180m'; fi; } # soft yellow
cc_version_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;249m'; fi; } # light gray
style_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;245m'; fi; } # gray
rst() { if [ "$use_color" -eq 1 ]; then printf '\033[0m'; fi; }

# ---- time helpers ----
progress_bar() {
  pct="${1:-0}"; width="${2:-10}"
  [[ "$pct" =~ ^[0-9]+$ ]] || pct=0; ((pct<0))&&pct=0; ((pct>100))&&pct=100
  filled=$(( pct * width / 100 )); empty=$(( width - filled ))
  printf '%*s' "$filled" '' | tr ' ' '='
  printf '%*s' "$empty" '' | tr ' ' '-'
}

# git utilities
num_or_zero() { v="$1"; [[ "$v" =~ ^[0-9]+$ ]] && echo "$v" || echo 0; }

# ---- JSON extraction utilities ----
extract_json_string() {
  local json="$1"
  local key="$2"
  local default="${3:-}"
  local field="${key##*.}"
  field="${field%% *}"
  local value=$(echo "$json" | grep -o "\"${field}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*:[[:space:]]*"\([^"]*\)".*/\1/')
  if [ -n "$value" ]; then
    value=$(echo "$value" | sed 's/\\\\/\//g')
  fi
  if [ -z "$value" ] || [ "$value" = "null" ]; then
    value=$(echo "$json" | grep -o "\"${field}\"[[:space:]]*:[[:space:]]*[0-9.]\+" | head -1 | sed 's/.*:[[:space:]]*\([0-9.]\+\).*/\1/')
  fi
  if [ -n "$value" ] && [ "$value" != "null" ]; then
    echo "$value"
  else
    echo "$default"
  fi
}

# ---- basics ----
if [ "$HAS_JQ" -eq 1 ]; then
  current_dir=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // "unknown"' 2>/dev/null | sed "s|^$HOME|~|g")
  model_name=$(echo "$input" | jq -r '.model.display_name // "Claude"' 2>/dev/null)
  model_version=$(echo "$input" | jq -r '.model.version // ""' 2>/dev/null)
  session_id=$(echo "$input" | jq -r '.session_id // ""' 2>/dev/null)
  cc_version=$(echo "$input" | jq -r '.version // ""' 2>/dev/null)
  output_style=$(echo "$input" | jq -r '.output_style.name // ""' 2>/dev/null)
else
  current_dir=$(echo "$input" | grep -o '"workspace"[[:space:]]*:[[:space:]]*{[^}]*"current_dir"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"current_dir"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | sed 's/\\\\/\//g')
  if [ -z "$current_dir" ] || [ "$current_dir" = "null" ]; then
    current_dir=$(echo "$input" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | sed 's/\\\\/\//g')
  fi
  [ -z "$current_dir" ] && current_dir="unknown"
  current_dir=$(echo "$current_dir" | sed "s|^$HOME|~|g")
  model_name=$(echo "$input" | grep -o '"model"[[:space:]]*:[[:space:]]*{[^}]*"display_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"display_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  [ -z "$model_name" ] && model_name="Claude"
  model_version=""
  session_id=$(extract_json_string "$input" "session_id" "")
  cc_version=$(echo "$input" | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  output_style=$(echo "$input" | grep -o '"output_style"[[:space:]]*:[[:space:]]*{[^}]*"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# ---- git colors ----
git_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;150m'; fi; }  # soft green

# ---- git ----
git_branch=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  git_branch=$(git branch --show-current 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
fi

# ---- context window calculation (native) ----
context_pct=""
context_remaining_pct=""
context_color() { if [ "$use_color" -eq 1 ]; then printf '\033[1;37m'; fi; }  # default white

if [ "$HAS_JQ" -eq 1 ]; then
  CONTEXT_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size // 200000' 2>/dev/null)
  USAGE=$(echo "$input" | jq '.context_window.current_usage' 2>/dev/null)

  if [ "$USAGE" != "null" ] && [ -n "$USAGE" ]; then
    CURRENT_TOKENS=$(echo "$USAGE" | jq '(.input_tokens // 0) + (.cache_creation_input_tokens // 0) + (.cache_read_input_tokens // 0)' 2>/dev/null)

    if [ -n "$CURRENT_TOKENS" ] && [ "$CURRENT_TOKENS" -gt 0 ] 2>/dev/null; then
      context_used_pct=$(( CURRENT_TOKENS * 100 / CONTEXT_SIZE ))
      context_remaining_pct=$(( 100 - context_used_pct ))
      (( context_remaining_pct < 0 )) && context_remaining_pct=0
      (( context_remaining_pct > 100 )) && context_remaining_pct=100

      if [ "$context_remaining_pct" -le 20 ]; then
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;203m'; fi; }  # coral red
      elif [ "$context_remaining_pct" -le 40 ]; then
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;215m'; fi; }  # peach
      else
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;158m'; fi; }  # mint green
      fi

      context_pct="${context_remaining_pct}%"
    fi
  fi
fi

# ---- usage colors ----
usage_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;189m'; fi; }  # lavender
cost_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;222m'; fi; }   # light gold
burn_color() { if [ "$use_color" -eq 1 ]; then printf '\033[38;5;220m'; fi; }   # bright gold

# ---- cost and usage extraction ----
cost_usd=""; cost_per_hour=""; tpm=""; tot_tokens=""

# Extract cost and token data from Claude Code's native input
if [ "$HAS_JQ" -eq 1 ]; then
  # Cost data
  cost_usd=$(echo "$input" | jq -r '.cost.total_cost_usd // empty' 2>/dev/null)
  total_duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // empty' 2>/dev/null)

  # Calculate burn rate ($/hour) from cost and duration
  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi

  # Token data from native context_window (no ccusage needed)
  input_tokens=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0' 2>/dev/null)
  output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0' 2>/dev/null)

  if [ "$input_tokens" != "null" ] && [ "$output_tokens" != "null" ]; then
    tot_tokens=$(( input_tokens + output_tokens ))
    [ "$tot_tokens" -eq 0 ] && tot_tokens=""
  fi

  # Calculate tokens per minute from native data
  if [ -n "$tot_tokens" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    tpm=$(echo "$tot_tokens $total_duration_ms" | awk '{if ($2 > 0) printf "%.0f", $1 * 60000 / $2; else print ""}')
  fi
else
  # Bash fallback for cost extraction
  cost_usd=$(echo "$input" | grep -o '"total_cost_usd"[[:space:]]*:[[:space:]]*[0-9.]*' | sed 's/.*:[[:space:]]*\([0-9.]*\).*/\1/')
  total_duration_ms=$(echo "$input" | grep -o '"total_duration_ms"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\([0-9]*\).*/\1/')

  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi

  # Token data from native context_window (bash fallback)
  input_tokens=$(echo "$input" | grep -o '"total_input_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\([0-9]*\).*/\1/')
  output_tokens=$(echo "$input" | grep -o '"total_output_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\([0-9]*\).*/\1/')

  if [ -n "$input_tokens" ] && [ -n "$output_tokens" ]; then
    tot_tokens=$(( input_tokens + output_tokens ))
    [ "$tot_tokens" -eq 0 ] && tot_tokens=""
  fi

  if [ -n "$tot_tokens" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    tpm=$(echo "$tot_tokens $total_duration_ms" | awk '{if ($2 > 0) printf "%.0f", $1 * 60000 / $2; else print ""}')
  fi
fi

# ---- log extracted data ----
{
  echo "[$TIMESTAMP] Extracted: dir=${current_dir:-}, model=${model_name:-}, version=${model_version:-}, git=${git_branch:-}, context=${context_pct:-}, cost=${cost_usd:-}, cost_ph=${cost_per_hour:-}, tokens=${tot_tokens:-}, tpm=${tpm:-}"
} >> "$LOG_FILE" 2>/dev/null

# ---- render statusline (single line) ----
output=""

# Directory (shortened to just folder name)
dir_short="${current_dir##*/}"
[ -z "$dir_short" ] && dir_short="$current_dir"
output="📁 $(dir_color)${dir_short}$(rst)"

# Git branch
if [ -n "$git_branch" ]; then
  output="$output  🌿 $(git_color)${git_branch}$(rst)"
fi

# Model
output="$output  🤖 $(model_color)${model_name}$(rst)"

# Claude Code version
if [ -n "$cc_version" ] && [ "$cc_version" != "null" ]; then
  output="$output  📟 $(cc_version_color)v${cc_version}$(rst)"
fi

# Context remaining with mini progress bar
if [ -n "$context_pct" ]; then
  context_bar=$(progress_bar "$context_remaining_pct" 8)
  output="$output  🧠 $(context_color)${context_pct}[${context_bar}]$(rst)"
fi

# Cost and burn rate
if [ -n "$cost_usd" ] && [[ "$cost_usd" =~ ^[0-9.]+$ ]]; then
  cost_fmt=$(printf '%.2f' "$cost_usd")
  if [ -n "$cost_per_hour" ] && [[ "$cost_per_hour" =~ ^[0-9.]+$ ]]; then
    burn_fmt=$(printf '%.2f' "$cost_per_hour")
    output="$output  💰 $(cost_color)\$${cost_fmt}$(rst)($(burn_color)\$${burn_fmt}/h$(rst))"
  else
    output="$output  💰 $(cost_color)\$${cost_fmt}$(rst)"
  fi
fi

# Tokens
if [ -n "$tot_tokens" ] && [[ "$tot_tokens" =~ ^[0-9]+$ ]]; then
  if [ -n "$tpm" ] && [[ "$tpm" =~ ^[0-9.]+$ ]]; then
    tpm_fmt=$(printf '%.0f' "$tpm")
    output="$output  📊 $(usage_color)${tot_tokens}tok(${tpm_fmt}tpm)$(rst)"
  else
    output="$output  📊 $(usage_color)${tot_tokens}tok$(rst)"
  fi
fi

# Print single line (no trailing newline for statusline)
printf '%s' "$output"
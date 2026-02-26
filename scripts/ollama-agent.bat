#!/bin/bash
# Ollama wrapper script for agents
# This script allows agents to use Ollama models directly

MODEL=${1:-qwen3-coder:480b-cloud}
shift
MESSAGE="$@"

if [ -z "$MESSAGE" ]; then
  echo "Usage: ollama-agent <model> <message>"
  echo "Available models:"
  curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4
  exit 1
fi

# Call Ollama API
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$MESSAGE\"}],
    \"stream\": false
  }" | grep -o '"content":"[^"]*"' | cut -d'"' -f4

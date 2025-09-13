#!/bin/bash

# Auto-commit after each tool use
cd /Users/cjlee/Documents/Python/test_ClaudeCodeCLI_GitBackupTest

# Check if there are any changes to commit
if ! git diff --quiet || ! git diff --cached --quiet || [[ -n $(git ls-files --others --exclude-standard) ]]; then
    # Add all changes
    git add .
    
    # Create commit with timestamp
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
fi
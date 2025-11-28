FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install Supabase CLI
RUN npm install -g supabase

# Install Playwright system dependencies
RUN npx playwright install-deps chromium

# Set up Supabase CLI completion (optional, for better DX)
RUN supabase completion bash > /etc/bash_completion.d/supabase

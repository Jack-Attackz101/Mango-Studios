# Agentic OS (local, single user)

A cheap decision model (Jev) acts as traffic cop; Claude Code only runs when real thinking is needed; Fish Audio gives it a voice.
Full brief: see BUILD_SPEC. Status: **Phase 0** (scaffold + smoke tests).

## Run
    cp .env.example .env.local   # fill in keys
    npm install
    npm run smoke                # live checks: Jev, Fish TTS, Claude CLI
    npm run dev                  # API :8094, UI :5174 (bound to 127.0.0.1)

Secrets live only in `.env.local` (git-ignored). Missing keys disable that feature; there are no fallbacks.

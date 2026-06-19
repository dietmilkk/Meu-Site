#!/bin/bash
# Download all SoundCloud playlists, compress, and generate index
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
python3 scripts/update_music.py
echo ""
echo "Done! Open the SoundCloud app to play your music."

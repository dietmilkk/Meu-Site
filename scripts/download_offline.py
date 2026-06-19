#!/usr/bin/env python3
"""Baixa todas as playlists do SoundCloud na melhor qualidade,
com capa e metadados, pra ouvir offline no celular.

Salva em ~/Music/{playlist}/ (ou ~/Músicas/{playlist}/),
uma pasta por playlist.
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

PLAYLISTS = [
    {"id": "br",         "label": "br",         "url": "https://soundcloud.com/cu11/sets/lbo"},
    {"id": "soundscape", "label": "soundscape", "url": "https://soundcloud.com/cu11/sets/zd2"},
    {"id": "bass",       "label": "bass",       "url": "https://soundcloud.com/cu11/sets/3mk"},
    {"id": "58v",        "label": "guitar",     "url": "https://soundcloud.com/cu11/sets/58v"},
    {"id": "7kp",        "label": "emotion",    "url": "https://soundcloud.com/cu11/sets/7kp"},
    {"id": "vv4",        "label": "energy",     "url": "https://soundcloud.com/cu11/sets/vv4"},
]


def pasta_musicas():
    home = Path.home()
    for nome in ["Music", "M\u00fasicas"]:
        p = home / nome
        if p.is_dir():
            return p
    return home / "Music"


def achar_ytdlp():
    for cmd in (["yt-dlp"], [sys.executable, "-m", "yt_dlp"]):
        try:
            subprocess.run(cmd + ["--version"], capture_output=True, check=True)
            return cmd
        except Exception:
            continue
    print("ERRO: yt-dlp n\u00e3o instalado. Rode: pip3 install yt-dlp")
    sys.exit(1)


def baixar_playlist(yt_cmd, nome, url, destino):
    pasta = destino / nome
    pasta.mkdir(parents=True, exist_ok=True)

    # Pega lista plana de URLs
    result = subprocess.run(
        yt_cmd + ["--flat-playlist", "--dump-json", url],
        capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        print(f"  ERRO: {result.stderr.strip()[:100]}")
        return 0

    urls = []
    for linha in result.stdout.strip().split("\n"):
        if not linha:
            continue
        try:
            info = json.loads(linha)
            u = info.get("webpage_url") or info.get("url")
            if u:
                urls.append(u)
        except json.JSONDecodeError:
            continue

    if not urls:
        return 0

    print(f"  {len(urls)} faixas")

    # Escreve batch file e baixa tudo de uma vez
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for u in urls:
            f.write(u + "\n")
        batch = f.name

    try:
        subprocess.run(
            yt_cmd + [
                "-f", "hls_aac_160k/hls_aac_96k/http_mp3_1_0",
                "--embed-thumbnail",
                "--add-metadata",
                "--output", str(pasta / "%(title)s.%(ext)s"),
                "--batch-file", batch,
                "--ignore-errors",
                "--concurrent-fragments", "3",
            ],
            timeout=7200,
        )
    finally:
        os.unlink(batch)

    return len(urls)


def main():
    saida = pasta_musicas()
    yt_cmd = achar_ytdlp()

    print("=" * 60)
    print(f"Destino: {saida}")
    print("Copie as pastas pro celular depois.")
    print("=" * 60)

    total = 0
    for pl in PLAYLISTS:
        print(f"\n--- {pl['label']} ---")
        n = baixar_playlist(yt_cmd, pl["label"], pl["url"], saida)
        total += n

    print(f"\n{'=' * 60}")
    print(f"Conclu\u00eddo! {total} m\u00fasicas em {saida}")


if __name__ == "__main__":
    main()

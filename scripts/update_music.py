#!/usr/bin/env python3
"""Download SoundCloud tracks into a shared directory, deduplicated by ID."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TRACKS_DIR = ROOT / "assets" / "music" / "tracks"
INDEX_JSON = ROOT / "assets" / "music" / "index.json"
INDEX_JS = ROOT / "assets" / "music" / "index.js"

PLAYLISTS = [
    {"id": "br",         "label": "br",         "url": "https://soundcloud.com/cu11/sets/lbo"},
    {"id": "soundscape", "label": "soundscape", "url": "https://soundcloud.com/cu11/sets/zd2"},
    {"id": "bass",       "label": "bass",       "url": "https://soundcloud.com/cu11/sets/3mk"},
    {"id": "58v",        "label": "guitar",     "url": "https://soundcloud.com/cu11/sets/58v"},
    {"id": "7kp",        "label": "emotion",    "url": "https://soundcloud.com/cu11/sets/7kp"},
    {"id": "vv4",        "label": "energy",     "url": "https://soundcloud.com/cu11/sets/vv4"},
]


def check_ytdlp():
    for cmd in (["yt-dlp"], [sys.executable, "-m", "yt_dlp"]):
        try:
            subprocess.run(cmd + ["--version"], capture_output=True, check=True)
            return cmd
        except Exception:
            continue
    print("ERROR: yt-dlp not found. Install: pip3 install yt-dlp")
    sys.exit(1)


def get_flat_tracks(yt_cmd, playlist_url):
    """Fast flat listing to get {sc_id, url} from a playlist."""
    result = subprocess.run(
        yt_cmd + ["--flat-playlist", "--dump-json", playlist_url],
        capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        print(f"  Error: {result.stderr.strip()[:100]}")
        return []

    tracks = []
    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            data = json.loads(line)
            url = data.get("url") or data.get("webpage_url")
            sc_id = str(data.get("id", ""))
            if not url or not sc_id:
                continue
            tracks.append({"sc_id": sc_id, "url": url})
        except json.JSONDecodeError:
            continue
    return tracks


METADATA_CACHE = ROOT / "assets" / "music" / ".metadata_cache.json"


def load_metadata_cache():
    """Load cached metadata to avoid re-fetching for every run."""
    if METADATA_CACHE.exists():
        try:
            return json.loads(METADATA_CACHE.read_text())
        except Exception:
            pass
    return {}


def save_metadata_cache(cache):
    """Persist metadata cache."""
    METADATA_CACHE.parent.mkdir(parents=True, exist_ok=True)
    METADATA_CACHE.write_text(json.dumps(cache, ensure_ascii=False))


def get_all_metadata(yt_cmd, playlist_url, existing_cache):
    """Fetch full metadata for ALL tracks in a playlist with one non-flat dump.
    Returns {sc_id: {title, artist, artwork, duration}}.
    Uses cache for tracks already fetched."""
    meta = {}

    # First, get track IDs quickly via flat listing
    flat_result = subprocess.run(
        yt_cmd + ["--flat-playlist", "--dump-json", playlist_url],
        capture_output=True, text=True, timeout=60,
    )
    if flat_result.returncode != 0:
        print(f"  Flat listing error: {flat_result.stderr.strip()[:100]}")
        return meta

    flat_ids = set()
    for line in flat_result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            d = json.loads(line)
            sc_id = str(d.get("id", ""))
            if sc_id:
                flat_ids.add(sc_id)
        except json.JSONDecodeError:
            continue

    if not flat_ids:
        return meta

    # Use cached metadata for tracks we already know about
    cached_ids = set()
    for sc_id in flat_ids:
        if sc_id in existing_cache:
            meta[sc_id] = existing_cache[sc_id]
            cached_ids.add(sc_id)

    missing_ids = flat_ids - cached_ids
    if not missing_ids:
        return meta

    print(f"    Fetching new metadata for {len(missing_ids)} tracks...")
    # Fetch missing metadata with non-flat dump
    # We pass individual track URLs for only the missing ones to save time
    missing_urls = []
    for line in flat_result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            d = json.loads(line)
            sc_id = str(d.get("id", ""))
            if sc_id in missing_ids:
                url = d.get("webpage_url") or d.get("url")
                if url:
                    missing_urls.append(url)
        except json.JSONDecodeError:
            continue

    if not missing_urls:
        return meta

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for url in missing_urls:
            f.write(url + "\n")
        batch_path = f.name

    try:
        result = subprocess.run(
            yt_cmd + ["--skip-download", "--dump-json", "--batch-file", batch_path],
            capture_output=True, text=True, timeout=600,
        )
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue
            try:
                data = json.loads(line)
                sc_id = str(data.get("id", ""))
                if not sc_id:
                    continue
                entry = {
                    "title": data.get("title", "") or "",
                    "artist": data.get("uploader", "") or "",
                    "artwork": data.get("thumbnail", "") or "",
                    "duration": data.get("duration", 0) or 0,
                }
                meta[sc_id] = entry
                existing_cache[sc_id] = entry
            except json.JSONDecodeError:
                continue
    finally:
        os.unlink(batch_path)

    return meta


def extract_title_from_url(url):
    """Extract a human-readable title from a regular SoundCloud URL."""
    if "api-v2" in url:
        return None
    try:
        return url.rstrip("/").split("/")[-1].replace("-", " ").title()
    except Exception:
        return None


def sync_playlist(yt_cmd, flat_tracks, playlist_url, cache):
    """Download any uncached tracks into shared tracks/ dir.
    Returns a list of metadata dicts for this playlist.
    Updates `cache` in place with newly-fetched metadata."""
    TRACKS_DIR.mkdir(parents=True, exist_ok=True)

    uncached = []

    for t in flat_tracks:
        sc_id = t["sc_id"]
        existing = list(TRACKS_DIR.glob(f"{sc_id}.*"))
        if not existing:
            uncached.append(t)

    if uncached:
        print(f"  Need to download {len(uncached)}/{len(flat_tracks)} tracks...")
        with tempfile.TemporaryDirectory() as tmpdir:
            batch_file = os.path.join(tmpdir, "urls.txt")
            with open(batch_file, "w") as f:
                for t in uncached:
                    f.write(t["url"] + "\n")

            subprocess.run(
                yt_cmd + [
                    "-f", "hls_aac_96k/http_mp3_1_0",
                    "--concurrent-fragments", "3",
                    "--output", os.path.join(tmpdir, "%(id)s.%(ext)s"),
                    "--batch-file", batch_file,
                    "--ignore-errors",
                ],
                capture_output=True, text=True, timeout=7200,
            )

            downloaded = {}
            for f in Path(tmpdir).glob("*"):
                if f.suffix in (".mp3", ".m4a") and f.is_file():
                    downloaded[f.stem] = f

            for t in uncached:
                sc_id = t["sc_id"]
                src = downloaded.get(sc_id)
                if src and src.exists():
                    dst = TRACKS_DIR / f"{sc_id}{src.suffix}"
                    if not dst.exists():
                        shutil.copy2(src, dst)
                    kb = dst.stat().st_size // 1024
                    print(f"    {t['url']} ({kb}K)")
                else:
                    print(f"    {t['url']} — FAILED")
    else:
        if flat_tracks:
            print(f"  All {len(flat_tracks)} tracks cached")

    # Fetch full metadata (uses cache for already-known tracks)
    print(f"  Fetching metadata for {len(flat_tracks)} tracks...")
    all_meta = get_all_metadata(yt_cmd, playlist_url, cache)

    results = []
    for t in flat_tracks:
        sc_id = t["sc_id"]
        files = list(TRACKS_DIR.glob(f"{sc_id}.*"))
        if not files:
            continue
        track_file = str(files[0].relative_to(ROOT))

        meta = all_meta.get(sc_id)
        if meta:
            results.append({
                "title": meta["title"],
                "artist": meta["artist"],
                "artwork": meta["artwork"],
                "duration": meta["duration"],
                "url": t["url"],
                "file": track_file,
            })
        else:
            # Fallback: extract title from URL
            title = extract_title_from_url(t["url"]) or sc_id
            results.append({
                "title": title,
                "artist": "",
                "artwork": "",
                "duration": 0,
                "url": t["url"],
                "file": track_file,
            })

    return results


def write_index(index):
    """Write both index.json (fetch) and index.js (file:// fallback)."""
    with open(INDEX_JSON, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    js = "window.__MUSIC_INDEX=" + json.dumps(index, ensure_ascii=False) + ";"
    with open(INDEX_JS, "w", encoding="utf-8") as f:
        f.write(js)
    jkb = INDEX_JSON.stat().st_size // 1024
    jskb = INDEX_JS.stat().st_size // 1024
    print(f"  index.json ({jkb}K) + index.js ({jskb}K)")


def clean_old_dirs():
    """Remove old per-playlist music dirs (files now in shared tracks/)."""
    for pl in PLAYLISTS:
        pl_dir = ROOT / "assets" / "music" / pl["id"]
        if pl_dir.is_dir():
            shutil.rmtree(pl_dir)
            print(f"  Removed old {pl_dir.name}/")

    for f in TRACKS_DIR.parent.rglob("*.mp3.gz"):
        f.unlink()
        print(f"  Removed stale {f.relative_to(ROOT)}")


def main():
    print("SoundCloud Music Downloader")
    print("=" * 60)

    yt_cmd = check_ytdlp()
    cache = load_metadata_cache()
    index = {}

    for pl in PLAYLISTS:
        print(f"\n--- {pl['label']} ({pl['url']}) ---")
        print("  Fetching tracks...")

        flat = get_flat_tracks(yt_cmd, pl["url"])
        if not flat:
            print("  No tracks found")
            index[pl["id"]] = {"label": pl["label"], "url": pl["url"], "tracks": []}
            continue

        print(f"  {len(flat)} tracks")
        results = sync_playlist(yt_cmd, flat, pl["url"], cache)
        index[pl["id"]] = {"label": pl["label"], "url": pl["url"], "tracks": results}
        ok = sum(1 for t in results if t.get("file"))
        print(f"  -> {ok}/{len(flat)} OK")

    save_metadata_cache(cache)
    write_index(index)

    total = sum(len(p["tracks"]) for p in index.values())
    unique = len({t.get("file") for p in index.values() for t in p["tracks"] if t.get("file")})
    print(f"\nDone! {total} track entries, {unique} unique files.")

    print("\nCleaning up old per-playlist directories...")
    clean_old_dirs()


if __name__ == "__main__":
    main()

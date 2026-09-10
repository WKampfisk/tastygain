#!/usr/bin/env python3
"""Regenerate PWA / iOS / Android icons and splash screens from public/brand/logo.jpg"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "public" / "brand" / "logo.jpg"
out = ROOT / "public" / "icons"
splash_dir = ROOT / "public" / "splash"
out.mkdir(parents=True, exist_ok=True)
splash_dir.mkdir(parents=True, exist_ok=True)

img = Image.open(src).convert("RGBA")
sizes = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512]

for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    bg = Image.new("RGB", (s, s), (255, 252, 248))
    bg.paste(resized.convert("RGB"), (0, 0))
    bg.save(out / f"icon-{s}.png", "PNG", optimize=True)

for s in (192, 512):
    pad = int(s * 0.1)
    inner = s - 2 * pad
    bg = Image.new("RGB", (s, s), (246, 250, 246))
    logo = img.resize((inner, inner), Image.Resampling.LANCZOS).convert("RGB")
    bg.paste(logo, (pad, pad))
    bg.save(out / f"icon-maskable-{s}.png", "PNG", optimize=True)

Image.open(out / "icon-32.png").save(out / "favicon.ico", sizes=[(16, 16), (32, 32)])
Image.open(out / "icon-180.png").save(out / "apple-touch-icon.png")


def make_splash(w, h, name):
    splash = Image.new("RGB", (w, h), (246, 250, 246))
    logo_s = min(w, h) // 3
    logo = img.resize((logo_s, logo_s), Image.Resampling.LANCZOS).convert("RGB")
    splash.paste(logo, ((w - logo_s) // 2, (h - logo_s) // 2 - h // 20))
    splash.save(splash_dir / name, "PNG", optimize=True)


make_splash(1170, 2532, "apple-splash-1170x2532.png")
make_splash(1284, 2778, "apple-splash-1284x2778.png")
make_splash(1080, 1920, "android-splash-1080x1920.png")
make_splash(2048, 2732, "apple-splash-ipad-2048x2732.png")
print("OK — icons + splash regenerated")

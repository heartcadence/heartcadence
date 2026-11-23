"""Convert supplier logos to WebP for the site.
Usage: python3 scripts/convert-logos.py <folder of PNG logos> public/images/providers src/data/providers.json
Note: re-running rewrites providers.json, so any categories or featured flags you set are lost. Merge by hand if needed.
Only changes: format (PNG to WebP) and size (fit inside 320x160, the 2x size
of the 160x80 logo slot). Colours, aspect ratio and transparency are kept.
"""
import json, os, re, sys, unicodedata
from PIL import Image

SRC, OUT, DATA = sys.argv[1], sys.argv[2], sys.argv[3]
EXCLUDE = {"WTP logo.png", "vMOX.png"}  # WTP: not a standard tile, check with Jason. vMOX: source file is damaged.
MAX_W, MAX_H = 320, 160

# Brand names whose file names lost punctuation. Only clear cases.
NAMES = {
    "ATT Wireless": "AT&T Wireless",
    "boostai": "boost.ai",
    "Koreai": "Kore.ai",
    "Yellowai": "Yellow.ai",
    "Xeboai": "Xebo.ai",
    "Regalai": "Regal.ai",
    "LinkLiveai": "LinkLive.ai",
    "EliteCXai": "EliteCX.ai",
    "CloudAdminio": "CloudAdmin.io",
    "FreeConferenceCallcom": "FreeConferenceCall.com",
    "ujetcx": "UJET",
}

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.replace("&", " and ").replace("+", " and ")
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

os.makedirs(OUT, exist_ok=True)
items, seen = [], set()
for f in sorted(os.listdir(SRC), key=str.lower):
    if not f.lower().endswith(".png") or f in EXCLUDE:
        continue
    stem = f[:-4]
    name = NAMES.get(stem, stem)
    slug = slugify(name)
    assert slug not in seen, slug
    seen.add(slug)
    im = Image.open(os.path.join(SRC, f))
    im = im.convert("RGBA")  # lossless mode change, same colours
    if im.width > MAX_W or im.height > MAX_H:
        im.thumbnail((MAX_W, MAX_H), Image.LANCZOS)  # keeps aspect ratio, never upscales
    im.save(os.path.join(OUT, slug + ".webp"), "WEBP", lossless=True, quality=100, method=4, exact=True)
    items.append({
        "name": name,
        "slug": slug,
        "logo": f"/images/providers/{slug}.webp",
        "width": im.width,
        "height": im.height,
        "categories": [],
        "featured": False,
        "include": True,
        "sourceFile": f,
    })

with open(DATA, "w", encoding="utf-8") as fh:
    json.dump(items, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print(len(items), "logos")

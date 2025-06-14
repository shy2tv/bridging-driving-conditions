from PIL import Image
from pathlib import Path

# List of large PNG images to optimise
IMAGES = [
    (Path("images/aux_input_types_comparison.png"), 1200),
    (Path("images/controlnet_blending.png"), 1200),
]

QUALITY_WEBP = 80


def make_preview(src: Path, max_width: int):
    if not src.exists():
        print("Source not found:", src)
        return None
    dst = src.with_name(src.stem + "-preview.webp")
    im = Image.open(src)
    w, h = im.size
    if w > max_width:
        new_h = int(h * max_width / w)
        im = im.resize((max_width, new_h), Image.LANCZOS)
    im.save(dst, "WEBP", quality=QUALITY_WEBP, method=6)
    print("Created", dst, "->", dst.stat().st_size // 1024, "KB")
    return dst


def main():
    for src, width in IMAGES:
        make_preview(src, width)


if __name__ == "__main__":
    main() 
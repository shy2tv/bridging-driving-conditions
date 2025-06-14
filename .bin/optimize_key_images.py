from PIL import Image
from pathlib import Path

configs = [
    (
        'images/aux_input_types_comparison.png',
        'images/aux_input_types_comparison-thumb.jpg',
        1600,
    ),
    # (
    #     'images/controlnet_blending.png',
    #     'images/controlnet_blending-thumb.jpg',
    #     1600,
    # ),
]

QUALITY = 80

def optimize(src_path: str, dest_path: str, max_width: int):
    p = Path(src_path)
    if not p.exists():
        print(f'Skip {src_path}: not found')
        return
    img = Image.open(p)
    w, h = img.size
    if w > max_width:
        new_h = int(h * max_width / w)
        img = img.resize((max_width, new_h), Image.LANCZOS)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(dest_path, format='JPEG', quality=QUALITY, optimize=True, progressive=True)
    print(f'Wrote {dest_path} ({max_width}px wide)')

if __name__ == '__main__':
    for src, dest, w in configs:
        optimize(src, dest, w) 
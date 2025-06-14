from PIL import Image

SRC = 'images/Bosch-Cover.jpg'
DEST_JPG = 'images/Bosch-Cover-optim.jpg'
DEST_WEBP = 'images/Bosch-Cover.webp'
TARGET_WIDTH = 1920  # px
QUALITY_JPG = 75
QUALITY_WEBP = 80


def main():
    img = Image.open(SRC)
    w, h = img.size
    if w > TARGET_WIDTH:
        new_h = int(h * TARGET_WIDTH / w)
        img = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
    
    # Save optimized JPEG
    img.save(DEST_JPG, format='JPEG', quality=QUALITY_JPG, optimize=True, progressive=True)
    # Save WebP (may fail if Pillow lacks WebP support)
    try:
        img.save(DEST_WEBP, format='WEBP', quality=QUALITY_WEBP, method=6)
    except OSError as e:
        print('WebP save failed:', e)

    print('Optimized images written to:', DEST_JPG, DEST_WEBP)


if __name__ == '__main__':
    main() 
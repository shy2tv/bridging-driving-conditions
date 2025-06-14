import os
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True
SRC = 'images/aux_input_types_comparison.png'
DST = 'images/aux_input_types_comparison-preview.webp'
WIDTH = 1600

def main():
    if not os.path.exists(SRC):
        print('Source image not found:', SRC)
        return
    im = Image.open(SRC)
    im = im.convert('RGB')
    h = int(im.height * WIDTH / im.width)
    im = im.resize((WIDTH, h), Image.LANCZOS)
    im.save(DST, 'WEBP', quality=80, method=6)
    print('Wrote', DST, 'size', os.path.getsize(DST)//1024, 'KB')

if __name__ == '__main__':
    main() 
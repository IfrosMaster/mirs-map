import os
from PIL import Image

# Hardcoded input and output folders
INPUT_FOLDER = 'data/images/MIRS/MIRS 4'
OUTPUT_FOLDER = 'data/images/MIRS/MIRS 4'
# OUTPUT_FOLDER = 'data/images/IFROS/IFROS 4'
RESIZE_TO = (50, 50)  # Width x Height

def resize_images(input_dir, output_dir, size):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        filepath = os.path.join(input_dir, filename)
        if os.path.isfile(filepath):
            try:
                with Image.open(filepath) as img:
                    img = img.resize(size)
                    output_path = os.path.join(output_dir, filename)
                    img.save(output_path)
                    print(f"Resized and saved: {output_path}")
            except Exception as e:
                print(f"Skipping {filename}: {e}")

if __name__ == '__main__':
    resize_images(INPUT_FOLDER, OUTPUT_FOLDER, RESIZE_TO)

import os
import tempfile
import io
from apng import APNG
from PIL import Image

def process_apng(input_path, output_path, scale=1, delay=300):
    """
    Processes a single APNG file:
      - Extracts frames and resizes them by the given scale.
      - Saves the resized frames as PNG files in a temporary folder.
      - Reassembles the frames into a new APNG using a fixed delay.
    
    Parameters:
      input_path (str): Path to the input APNG file.
      output_path (str): Path to save the new APNG.
      scale (float): Scale factor for resizing (e.g., 0.3 for 30% of original size).
      delay (int): Delay (in hundredths of a second) between frames.
    """
    # Create a temporary directory for resized frame images.
    with tempfile.TemporaryDirectory() as tmp_dir:
        frame_files = []  # To store the paths of resized frames

        # Open the original APNG
        im = APNG.open(input_path)
        for i, (png, control) in enumerate(im.frames):
            # Convert the APNG frame to bytes and open it with Pillow.
            raw_bytes = png.to_bytes()
            img = Image.open(io.BytesIO(raw_bytes))

            # Compute new dimensions.
            new_width = int(img.width * scale)
            new_height = int(img.height * scale)

            # Resize the image.
            resized_img = img.resize((new_width, new_height), Image.LANCZOS)

            # Save the resized frame to the temporary directory.
            frame_filename = os.path.join(tmp_dir, f"{i}.png")            
            resized_img.save(frame_filename, format="PNG")
            frame_files.append(frame_filename)

        # Reassemble a new APNG from the resized frame files.
        new_apng = APNG.from_files(frame_files, delay=delay)
        #if exists delte
        if os.path.exists(output_path):
            os.remove(output_path)
        new_apng.save(output_path)
        print(f"Created new APNG: {output_path}")

def reduce_res_recursive(input_folder, output_folder, scale=1):
    """
    Recursively find .apng files, resize them, and save to output_folder.
    """
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if file.lower().endswith(".apng"):
                input_file = os.path.join(root, file)
                # Mirror the folder structure in the output directory
                output_file = os.path.join(output_folder, os.path.relpath(input_file, input_folder))
                os.makedirs(os.path.dirname(output_file), exist_ok=True)
                process_apng(input_file, output_file, scale=scale)


input_folder = "/home/shy2tv/fs_shy2tv/nuScene_DAUNIT_present/histogram_gifs_reduced"
output_folder = "/home/shy2tv/fs_shy2tv/nuScene_DAUNIT_present/histogram_gifs_reduced"
reduce_res_recursive(input_folder, output_folder, scale=0.5)
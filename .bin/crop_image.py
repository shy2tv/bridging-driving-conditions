from PIL import Image

# Open the image
img = Image.open('images/profile_yahia_1.jpg')

# Get the dimensions
width, height = img.size

# Calculate crop dimensions for a closer face crop
# Using a smaller crop size and adjusting the center point
crop_size = min(width, height) * 0.7  # Make the crop size smaller
left = (width - crop_size) / 2
top = (height - crop_size) / 2 - height * 0.1  # Move the crop up slightly
right = left + crop_size
bottom = top + crop_size

# Crop the image
cropped_img = img.crop((left, top, right, bottom))

# Save the cropped image
cropped_img.save('images/profile_yahia_1_cropped.jpg') 
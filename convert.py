import os
import subprocess
import sys

def convert_apng_to_mp4_direct(input_path, output_path, quality='medium'):
    """
    Convert APNG directly to MP4 using FFmpeg (faster, no intermediate files)
    """
    # Quality settings
    if quality == 'high':
        crf = '18'
        preset = 'slow'
    elif quality == 'low':
        crf = '28'
        preset = 'fast'
    else:  # medium
        crf = '23'
        preset = 'medium'
    
    # FFmpeg command for direct APNG to MP4 conversion
    cmd = [
        'ffmpeg',
        '-i', input_path,           # Input APNG
        '-c:v', 'libx264',          # Video codec
        '-preset', preset,          # Encoding speed/compression tradeoff
        '-crf', crf,                # Quality (lower = better)
        '-pix_fmt', 'yuv420p',      # Pixel format for compatibility
        '-movflags', '+faststart',   # Web optimization
        '-profile:v', 'baseline',    # Browser compatibility
        '-level', '3.0',            # HTML5 video compatibility
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',  # Ensure even dimensions
        '-y',                       # Overwrite output file
        output_path
    ]
    
    try:
        # Run FFmpeg with suppressed output
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"   FFmpeg error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("   ❌ FFmpeg not found! Please install FFmpeg first.")
        print("   Download from: https://ffmpeg.org/download.html")
        return False

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def process_directory(directory_path, quality='medium', skip_existing=True):
    """Process all APNG files in directory"""
    total_files = 0
    converted_files = 0
    total_size_before = 0
    total_size_after = 0
    
    # Walk through all files in the directory
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.lower().endswith('.apng'):
                total_files += 1
                input_path = os.path.join(root, file)
                output_path = os.path.join(root, os.path.splitext(file)[0] + '.mp4')
                
                # Skip if output already exists
                if skip_existing and os.path.exists(output_path):
                    print(f"⏭️  Skipping {file} (MP4 already exists)")
                    continue
                
                # Get original file size
                original_size = get_file_size_mb(input_path)
                total_size_before += original_size
                
                print(f"🔄 Converting {file} ({original_size:.1f}MB)")
                
                if convert_apng_to_mp4_direct(input_path, output_path, quality):
                    # Get converted file size
                    converted_size = get_file_size_mb(output_path)
                    total_size_after += converted_size
                    converted_files += 1
                    
                    # Calculate compression ratio
                    compression = ((original_size - converted_size) / original_size) * 100
                    
                    print(f"✅ Success! {file}")
                    print(f"   Size: {original_size:.1f}MB → {converted_size:.1f}MB ({compression:.1f}% smaller)")
                else:
                    print(f"❌ Failed to convert {file}")
    
    # Summary
    if total_files > 0:
        overall_compression = ((total_size_before - total_size_after) / total_size_before) * 100 if total_size_before > 0 else 0
        print(f"\n📊 SUMMARY:")
        print(f"   Files processed: {converted_files}/{total_files}")
        print(f"   Total size before: {total_size_before:.1f}MB")
        print(f"   Total size after: {total_size_after:.1f}MB")
        print(f"   Overall compression: {overall_compression:.1f}%")
    else:
        print("No APNG files found!")

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

if __name__ == "__main__":
    # Hardcoded configuration - APNGs are in videos folder
    videos_dir = "videos"
    quality = "high"     # Options: 'high', 'medium', 'low'
    
    # Check if FFmpeg is available
    if not check_ffmpeg():
        print("❌ FFmpeg is required but not found!")
        print("📥 Install FFmpeg from: https://ffmpeg.org/download.html")
        print("💡 Or use the MoviePy version instead")
        sys.exit(1)
    
    if not os.path.exists(videos_dir):
        print(f"❌ Directory {videos_dir} does not exist!")
    else:
        print(f"🚀 Starting conversion of APNG files in {videos_dir}")
        print(f"📐 Quality setting: {quality}")
        process_directory(videos_dir, quality, False)
        print("🎉 Conversion completed!")
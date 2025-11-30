#!/bin/bash
set -euo pipefail

# Set output directory
OUTPUT_DIR="public/icon"

# Check if ImageMagick is available
if ! command -v magick &> /dev/null; then
  echo "Error: ImageMagick (magick) is not installed or not in PATH"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Creating icons..."

# 1. Create stealth
magick -background none assets/icons/stealth.svg -resize 16x16 "$OUTPUT_DIR/stealth.png"

# 2. Create trans16, trans32, trans48, trans128, trans16-blocked, trans16-disabled
magick -background none assets/icons/trans.svg -resize 16x16 "$OUTPUT_DIR/trans16.png"
magick -background none assets/icons/trans.svg -resize 32x32 "$OUTPUT_DIR/trans32.png"
magick -background none assets/icons/trans.svg -resize 48x48 "$OUTPUT_DIR/trans48.png"
magick -background none assets/icons/trans.svg -resize 128x128 "$OUTPUT_DIR/trans128.png"
magick -background none assets/icons/trans-blocked.svg -resize 16x16 "$OUTPUT_DIR/trans16-blocked.png"
magick -background none assets/icons/trans-disabled.svg -resize 16x16 "$OUTPUT_DIR/trans16-disabled.png"

# 4. Create nb16, nb16-blocked, nb16-disabled
magick -background none assets/icons/nb.svg -resize 16x16 "$OUTPUT_DIR/nb16.png"
magick -background none assets/icons/nb-blocked.svg -resize 16x16 "$OUTPUT_DIR/nb16-blocked.png"
magick -background none assets/icons/nb-disabled.svg -resize 16x16 "$OUTPUT_DIR/nb16-disabled.png"

echo "Icons created successfully"
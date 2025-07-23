# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'
require 'mini_magick'
require 'open3'

RSpec.describe BaseImageUploader do
  let(:uploader) do
    user = build_stubbed(:user) # Assuming you have a User model or similar
    described_class.new(user, :avatar)
  end

  # This list combines technical/structural tags, with the whitelisted
  # ICC profile tags, and orientation tags.
  let(:allowed_exiftool_tags) do
    [
      # Core/Technical/Structural Tags
      'Bits Per Sample', 'Color Components', 'Directory', 'Encoding Process',
      'Exif Byte Order', 'ExifTool Version Number', 'File Access Date/Time',
      'File Inode Change Date/Time', 'File Modification Date/Time', 'File Name',
      'File Permissions', 'File Size', 'File Type', 'File Type Extension',
      'Image Height', 'Image Size', 'Image Width', 'Look Up Table Dimensions',
      'Megapixels', 'MIME Type', 'Primary Platform', 'Resolution Unit',
      'X Resolution', 'Y Cb Cr Positioning', 'YCbCrPositioning',
      'Y Cb Cr Sub Sampling', 'Y Resolution',
      # Orientation (whitelisted)
      'Orientation',
      # ICC Profile and Color Management (whitelisted)
      'Blue Matrix Column', 'Blue Tone Reproduction Curve', 'CMM Flags',
      'CMM Type', 'Chromatic Adaptation', 'Color Space Data',
      'Connection Space Illuminant', 'Device Attributes', 'Device Manufacturer',
      'Device Mfg Desc', 'Device Model', 'Device Model Desc', 'Gamut Volume',
      'Green Matrix Column', 'Green Tone Reproduction Curve', 'ICC Profile Name',
      'Measurement Adaptation', 'Measurement Backing', 'Measurement Flare',
      'Measurement Geometry', 'Measurement Illuminant', 'Measurement Observer',
      'Measurement Standard', 'Media White Point', 'Profile Class',
      'Profile CMM Type', 'Profile Connection Space', 'Profile Copyright',
      'Profile Creator', 'Profile Date Time', 'Profile Description',
      'Profile File Signature', 'Profile ID', 'Profile Version',
      'Red Matrix Column', 'Red Tone Reproduction Curve', 'Rendering Intent',
      'Technology'
    ].map(&:downcase).uniq.sort
  end

  # Any exiftool tags that are known to be harmless, empty, or inconsistent
  # and should be ignored during the "unexpected tags" check.
  let(:ignored_insignificant_exiftool_tags) do
    [
      'maker notes', # Can appear even if empty
      'offset schema' # Can appear if empty
      # Add other insignificant tags if they consistently appear and are harmless
    ].map(&:downcase)
  end

  describe 'image processing' do
    # `around` hook to ensure processing is enabled for this block and files are cleaned up.
    around do |example|
      described_class.enable_processing = true
      example.run # Execute the actual test example
      uploader.remove! if uploader.file # Clean up uploaded file if it exists
      described_class.enable_processing = false
    end

    let(:fixture_file_with_exif) { Rails.root.join('spec/fixtures/with_exif.jpeg').to_s }
    let(:fixture_file_with_orientation) { Rails.root.join('spec/fixtures/image_with_90_degree_exif_orientation.jpg').to_s }

    # Before each example in this block, upload the file needed for the test
    # This ensures a clean state for each `it` block
    before do
      # Determine which fixture file to use based on the test's context
      # This makes the `before` block slightly more dynamic for different tests
      file_to_upload =
        if RSpec.current_example.metadata[:description].include?('strips the image')
          File.open(fixture_file_with_exif)
        elsif RSpec.current_example.metadata[:description].include?('preserves image EXIF orientation')
          File.open(fixture_file_with_orientation)
        end
      uploader.store!(file_to_upload) if file_to_upload
    end

    it 'strips the image of all non-essential metadata, preserving only necessary structural info, ICC profile, and orientation' do
      original_image = MiniMagick::Image.open(fixture_file_with_exif)
      expect(original_image.exif).not_to be_empty, 'Original image should have EXIF data for this test to be meaningful'

      # Example `exiftool` output for a stripped image:
      # ExifTool Version Number         : 12.x
      # File Name                       : stripped_image.jpeg
      # File Type                       : JPEG
      # MIME Type                       : image/jpeg
      # Image Width                     : 1920
      # Image Height                    : 1080
      # Encoding Process                : Baseline DCT, Huffman coding
      # Bits Per Sample                 : 8
      # Color Components                : 3
      # Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
      # Resolution Unit                 : inches
      # X Resolution                    : 72
      # Y Resolution                    : 72
      # Orientation                     : Horizontal (normal)
      # ICC Profile Name                : sRGB IEC61966-2.1
      # CMM Type                        : Lino
      exiftool_output, stderr_str, status = Open3.capture3('exiftool', uploader.file.path)
      expect(status).to be_success, "exiftool command failed: #{stderr_str}. Output: #{exiftool_output}"

      actual_exiftool_tags = exiftool_output.lines.filter_map do |line|
        next if line.strip.empty? || line.start_with?('File Name')

        tag = line.split(':', 2).first&.strip
        tag&.downcase
      end.uniq.sort

      # Calculate unexpected tags: those present in the processed image but not in our allowed or ignored lists.
      unexpected_tags = actual_exiftool_tags - allowed_exiftool_tags - ignored_insignificant_exiftool_tags

      # Assert that no unexpected tags remain
      expect(unexpected_tags).to be_empty,
        "Unexpected metadata tags found by exiftool after stripping: #{unexpected_tags.join(', ')}"
    end

    context 'when handling images with EXIF orientation' do
      it 'preserves image EXIF orientation values' do
        original_image = MiniMagick::Image.open(fixture_file_with_orientation)
        expect(original_image.exif['Orientation']).to eq('6'), 'Original image should have Orientation 6'

        image = MiniMagick::Image.open(uploader.path)
        expect(image.exif['Orientation']).to eq('6'), 'Processed image should preserve Orientation 6'
      end
    end
  end

  it 'whitelists exactly [image/jpg image/jpeg image/gif image/png image/webp]' do
    expect(uploader.extension_allowlist).to match_array %w[jpg jpeg gif png webp]
    expect(uploader.content_type_allowlist).to match_array %w[image/jpg image/jpeg image/gif image/png image/webp]
    expect(uploader.extension_denylist).to be_blank
    expect(uploader.content_type_denylist).to be_blank
  end
end

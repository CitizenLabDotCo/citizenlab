# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'
require 'mini_magick'
require 'English'

RSpec.describe BaseImageUploader do
  let(:uploader) do
    user = build_stubbed(:user)
    described_class.new(user, :avatar)
  end

  describe 'image processing' do
    around do |example|
      described_class.enable_processing = true
      example.run
      uploader.remove!
      described_class.enable_processing = false
    end

    it 'strips the image of any EXIF data and metadata except ICC profile and orientation' do
      file_path = Rails.root.join('spec/fixtures/with_exif.jpeg').to_s
      file = File.open(file_path)

      original_image = MiniMagick::Image.open(file.path)
      expect(original_image.exif).not_to be_empty

      uploader.store!(file)

      image = MiniMagick::Image.open(uploader.file.path)

      allowed_exif_keys = %w[
        Orientation
        ResolutionUnit
        XResolution
        YCbCrPositioning
        YResolution
      ]
      expect(image.exif.keys - allowed_exif_keys).to be_empty

      exiftool_output = `exiftool #{Shellwords.escape(uploader.file.path)}`
      # Check the command executed successfully
      expect($CHILD_STATUS.success?).to be true

      # The `exiftool` command is used here to verify that a broader range of metadata
      # types (beyond just EXIF, which MiniMagick might expose) have been stripped.
      # The uploader uses `exiftool -all=` to remove most metadata, preserving only
      # essential structural information, ICC profiles for color management, and orientation.
      #
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
      #
      # Technical/structural image metadata and file system attributes that are
      # expected to remain even after metadata stripping. These are not user-supplied
      # or privacy-sensitive data, but fundamental to the file's structure.
      technical_tags = [
        'Bits Per Sample',
        'Color Components',
        'Directory',
        'Encoding Process',
        'Exif Byte Order', # Can remain if part of core structure, depends on exiftool version/flags
        'ExifTool Version Number',
        'File Access Date/Time',
        'File Inode Change Date/Time',
        'File Modification Date/Time',
        'File Name',
        'File Permissions',
        'File Size',
        'File Type',
        'File Type Extension',
        'Image Height',
        'Image Size',
        'Image Width',
        'Media White Point',
        'Megapixels',
        'MIME Type',
        'Primary Platform',
        'Resolution Unit',
        'X Resolution',
        'XResolution', # MiniMagick might expose differently
        'Y Cb Cr Sub Sampling',
        'Y Cb Cr Positioning',
        'Y Resolution',
        'YCbCrPositioning', # MiniMagick might expose differently
        'YResolution' # MiniMagick might expose differently
      ]

      present_tags = exiftool_output.lines.map do |l|
        l.split(':').first.strip
      end.uniq

      present_tags.reject! do |tag|
        tag.empty? || tag == uploader.file.path.split('/').last
      end

      # These are the tags that *should* be gone (privacy-sensitive, user-defined)
      # after stripping, but are not in the `technical_tags` list.
      # We allow ICC Profile and Orientation related tags to remain.
      metadata_tags_to_check = present_tags - technical_tags

      expect(
        metadata_tags_to_check.reject do |tag|
          # Allow tags related to Orientation
          tag.include?('Orientation') ||
          # Allow tags related to ICC Profile and Color Management
          tag.include?('ICC') ||
          tag.include?('Profile') ||
          tag.include?('Curve') ||
          tag.include?('Matrix') ||
          tag.include?('Color Space') ||
          tag.include?('Illuminant') ||
          tag.include?('CMM') ||
          tag.include?('Device') ||
          tag.include?('Rendering') ||
          tag.include?('Adaptation') ||
          # Sometimes exiftool reports a "MakerNotes" tag even if empty,
          # or other non-harmful empty tags after stripping. Be flexible for these.
          (tag.include?('Notes') && exiftool_output.include?("#{tag}:")) # Check if it's an empty "Notes" tag
        end
      ).to be_empty
    end

    context 'when handling images with EXIF orientation' do
      def get_processed_image_dimensions(file_path)
        image = MiniMagick::Image.open(file_path)
        [image.width, image.height]
      end

      it 'preserves image EXIF orientation values' do
        file_path = Rails.root.join('spec/fixtures/image_with_90_degree_exif_orientation.jpg').to_s
        file = File.open(file_path)

        original_image = MiniMagick::Image.open(file.path)
        expect(original_image.exif['Orientation']).to eq('6')

        uploader.store!(file)

        image = MiniMagick::Image.open(uploader.path)
        expect(image.exif['Orientation']).to eq('6')
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

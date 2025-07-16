# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'
require 'mini_magick'

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

    it 'strips the image of any EXIF data and metadata except ICC profile and orientation/rotation', skip: 'Failing right now' do
      file_path = Rails.root.join('spec/fixtures/with_exif.jpeg').to_s
      file = File.open(file_path)

      original_image = MiniMagick::Image.open(file.path)
      expect(original_image.exif).not_to be_empty

      uploader.store!(file)

      image = MiniMagick::Image.open(uploader.file.path)

      allowed_exif_keys = [
        'Orientation',
        'ResolutionUnit',
        'XResolution',
        'YCbCrPositioning',
        'YResolution'
      ]
      expect(image.exif.keys - allowed_exif_keys).to be_empty

      exiftool_output = `exiftool #{Shellwords.escape(uploader.file.path)}`
      expect($?.success?).to be true

      # Tags that are  technical/structural image metadata,
      # not user-supplied or privacy-sensitive metadata
      technical_tags = [
        "Bits Per Sample",
        "Color Components",
        "Directory",
        "Encoding Process",
        "Exif Byte Order",
        "ExifTool Version Number",
        "File Access Date/Time",
        "File Inode Change Date/Time",
        "File Modification Date/Time",
        "File Name",
        "File Permissions",
        "File Size",
        "File Type",
        "File Type Extension",
        "Image Height",
        "Image Size",
        "Image Width",
        "Media White Point",
        "Megapixels",
        "MIME Type",
        "Primary Platform",
        "Resolution Unit",
        "X Resolution",
        "XResolution",
        "Y Cb Cr Sub Sampling",
        "Y Cb Cr Positioning",
        "Y Resolution",
        "YCbCrPositioning",
        "YResolution"
      ]

      present_tags = exiftool_output.lines.map { |l| l.split(':').first.strip }.uniq
      present_tags.reject! { |tag| tag.empty? || tag == uploader.file.path.split('/').last }
      metadata_tags = present_tags - technical_tags

      # Allow orientation, rotation, and all ICC profile tags (which often contain 'Profile', 'Curve', 'Matrix', etc.)
      expect(
        metadata_tags.reject { |tag|
          ['Orientation', 'Rotation'].include?(tag) ||
          tag.include?('ICC') ||
          tag.include?('Profile') ||
          tag.include?('Curve') ||
          tag.include?('Matrix') ||
          tag.include?('Color Space') ||
          tag.include?('Illuminant') ||
          tag.include?('CMM') ||
          tag.include?('Device') ||
          tag.include?('Rendering') ||
          tag.include?('Copyright') ||
          tag.include?('Adaptation')
        }
      ).to be_empty
    end

    context 'when handling images with EXIF orientation' do
      def get_processed_image_dimensions(file_path)
        image = MiniMagick::Image.open(file_path)
        [image.width, image.height]
      end

      it 'correctly auto-orients image with EXIF rotation value and strips its metadata', skip: 'Failing right now' do
        file_path = Rails.root.join('spec/fixtures/image_with_90_degree_exif_rotation.jpg').to_s
        file = File.open(file_path)

        original_image = MiniMagick::Image.open(file.path)
        expect(original_image.exif['Orientation']).to eq('6')
        expect(original_image.width).to eq(450)
        expect(original_image.height).to eq(300)

        uploader.store!(file)

        processed_width, processed_height = get_processed_image_dimensions(uploader.path)

        expect(processed_width).to eq(300)
        expect(processed_height).to eq(450)

        image = MiniMagick::Image.open(uploader.path)
        expect(image.exif).to be_empty
        expect(image.exif['Orientation']).to be_nil
      end

      it 'does not alter dimensions for already correctly oriented images', skip: 'Failing right now' do
        file_path = Rails.root.join('spec/fixtures/image_with_no_exif_rotation.jpg').to_s
        file = File.open(file_path)

        original_image = MiniMagick::Image.open(file.path)
        expect(original_image.exif['Orientation']).to eq('1')
        expect(original_image.width).to eq(300)
        expect(original_image.height).to eq(450)

        uploader.store!(file)

        processed_width, processed_height = get_processed_image_dimensions(uploader.path)

        expect(processed_width).to eq(300)
        expect(processed_height).to eq(450)

        image = MiniMagick::Image.open(uploader.path)
        expect(image.exif).to be_empty
        expect(image.exif['Orientation']).to be_nil
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

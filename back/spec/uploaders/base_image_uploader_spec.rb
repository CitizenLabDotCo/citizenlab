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

    it 'strips the image of any EXIF data and metadata' do
      file_path = Rails.root.join('spec/fixtures/with_exif.jpeg').to_s
      file = File.open(file_path)

      original_image = MiniMagick::Image.open(file.path)
      expect(original_image.exif).not_to be_empty

      uploader.store!(file)

      image = MiniMagick::Image.open(uploader.file.path)
      expect(image.exif).to be_empty
    end

    context 'when handling images with EXIF orientation' do
      def get_processed_image_dimensions(file_path)
        image = MiniMagick::Image.open(file_path)
        [image.width, image.height]
      end

      it 'correctly auto-orients image with EXIF rotation value and strips its metadata' do
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

      it 'does not alter dimensions for already correctly oriented images' do
        file_path = Rails.root.join('spec/fixtures/image_with_zero_exif_rotation.jpg').to_s
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

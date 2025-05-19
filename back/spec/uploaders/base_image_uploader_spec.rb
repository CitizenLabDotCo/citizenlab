# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'

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
  end

  # Note that we no longer permit .svg files, due to cross-site scripting concerns,
  # raised in TAN-4535:
  # https://www.notion.so/govocal/Vilnius-security-concerns-to-investigate-1eb9663b7b26801cb669f161e527d4d9
  it 'whitelists exactly [image/jpg image/jpeg image/gif image/png image/webp]' do
    expect(uploader.extension_allowlist).to match_array %w[jpg jpeg gif png webp]
    expect(uploader.content_type_allowlist).to match_array %w[image/jpg image/jpeg image/gif image/png image/webp]
    expect(uploader.extension_denylist).to be_blank
    expect(uploader.content_type_denylist).to be_blank
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::LayoutImageUploader do
  let(:uploader) { described_class.new(ContentBuilder::LayoutImage.new, :image) }

  around do |example|
    described_class.enable_processing = true
    example.run
    uploader.remove! if uploader.file
    described_class.enable_processing = false
  end

  it 'allows SVG on top of the formats every image uploader takes' do
    expect(uploader.extension_allowlist).to match_array %w[jpg jpeg gif png webp avif svg]
    expect(uploader.content_type_allowlist).to match_array %w[
      image/jpg image/jpeg image/gif image/png image/webp image/avif image/svg+xml
    ]
  end

  it 'strips the executable content out of a stored SVG' do
    uploader.store! Rails.root.join('spec/fixtures/icon_with_script.svg').open

    stored = uploader.file.read
    expect(uploader.file.extension).to eq 'svg'
    expect(stored).to include '<circle'
    expect(stored).not_to include 'script'
    expect(stored).not_to include 'onload'
  end

  it 'still stores raster images' do
    uploader.store! Rails.root.join('spec/fixtures/image12.jpg').open

    expect(uploader.file.extension).to eq 'jpg'
  end
end

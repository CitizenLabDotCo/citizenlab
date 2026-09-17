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

  describe 'size limit' do
    include CarrierWave::Test::Matchers

    let(:tmp_dir) { Dir.mktmpdir }

    after { FileUtils.rm_rf(tmp_dir) }

    def generate_image(name, width, height, frames: 1)
      path = File.join(tmp_dir, name)
      MiniMagick::Tool::Convert.new do |convert|
        frames.times { |i| convert << '-size' << "#{width}x#{height}" << "xc:#{i.even? ? 'red' : 'blue'}" }
        convert << path
      end
      File.open(path)
    end

    it 'shrinks an original larger than the maximum size' do
      uploader.store! generate_image('large.jpg', 3000, 2000)

      expect(uploader).to have_dimensions(2400, 1600)
    end

    it 'keeps the size of an original that already fits' do
      uploader.store! Rails.root.join('spec/fixtures/image12.jpg').open

      expect(uploader).to have_dimensions(1200, 900)
    end

    it 'keeps every frame of an animated GIF it shrinks' do
      uploader.store! generate_image('animated.gif', 3000, 100, frames: 2)

      image = MiniMagick::Image.new(uploader.path)
      expect(image.frames.size).to eq 2
      expect(image.width).to eq 2400
    end
  end
end

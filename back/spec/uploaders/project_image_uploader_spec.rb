# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectImageUploader do
  let(:uploader) { described_class.new(build_stubbed(:project_image), :image) }
  let(:tmp_dir) { Dir.mktmpdir }

  around do |example|
    described_class.enable_processing = true
    example.run
    uploader.remove! if uploader.file
    described_class.enable_processing = false
  end

  after { FileUtils.rm_rf(tmp_dir) }

  def generate_image(name, quality: nil)
    path = File.join(tmp_dir, name)
    MiniMagick::Tool::Convert.new do |convert|
      convert << '-size' << '1200x900' << 'gradient:red-blue'
      convert << '-quality' << quality.to_s if quality
      convert << path
    end
    File.open(path)
  end

  def quality(file)
    MiniMagick::Image.new(file.path)['%Q'].to_i
  end

  it 'saves a JPEG version at a lower quality' do
    uploader.store! generate_image('photo.jpg', quality: 95)

    expect(quality(uploader.large)).to eq BaseImageUploader::VERSION_QUALITY
  end

  it 'does not re-encode a JPEG already at a lower quality' do
    uploader.store! generate_image('photo.jpg', quality: 60)

    expect(quality(uploader.large)).to eq 60
  end

  it 'keeps a PNG version a PNG' do
    uploader.store! generate_image('logo.png')

    expect(MiniMagick::Image.new(uploader.large.path).type).to eq 'PNG'
  end
end

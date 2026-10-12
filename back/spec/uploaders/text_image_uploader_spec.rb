# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'

RSpec.describe TextImageUploader do
  include CarrierWave::Test::Matchers

  let(:uploader) { described_class.new(TextImage.new, :image) }
  let(:tmp_dir) { Dir.mktmpdir }

  around do |example|
    described_class.enable_processing = true
    example.run
    uploader.remove! if uploader.file
    described_class.enable_processing = false
  end

  after { FileUtils.rm_rf(tmp_dir) }

  it 'shrinks an image larger than the maximum size' do
    path = File.join(tmp_dir, 'large.jpg')
    MiniMagick::Tool::Convert.new { |convert| convert << '-size' << '3000x2000' << 'xc:red' << path }

    uploader.store! File.open(path)

    expect(uploader).to have_dimensions(2400, 1600)
  end

  it 'keeps the size of an image that already fits' do
    uploader.store! Rails.root.join('spec/fixtures/image12.jpg').open

    expect(uploader).to have_dimensions(1200, 900)
  end
end

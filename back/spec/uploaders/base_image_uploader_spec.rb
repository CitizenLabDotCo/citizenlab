# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'
require 'mini_magick'
require 'open3'
require 'json' # Required for JSON parsing

RSpec.describe BaseImageUploader do
  let(:uploader) do
    user = build_stubbed(:user)
    described_class.new(user, :avatar)
  end

  # This list combines technical/structural tags, with the whitelisted
  # ICC profile tags, and orientation tags.
  # These are the *keys* we expect in the JSON output, often in PascalCase or CamelCase.
  # ExifTool often normalizes these, so let's stick to a consistent casing, e.g., PascalCase.
  let(:allowed_exiftool_json_keys) do
    [
      # Core/Technical/Structural Tags
      'BitsPerSample', 'ColorComponents', 'Directory', 'EncodingProcess',
      'ExifByteOrder', 'ExifToolVersion', 'ExifToolVersionNumber', 'FileAccessDate',
      'FileInodeChangeDate', 'FileModifyDate', 'FileModificationDate', 'FileName',
      'FilePermissions', 'FileSize', 'FileType', 'FileTypeExtension', 'ImageHeight',
      'ImageSize', 'ImageWidth', 'LookUpTableDimensions', 'Megapixels', 'MIMEType',
      'PrimaryPlatform', 'ResolutionUnit', 'SourceFile', 'XResolution',
      'YCbCrPositioning', 'YCbCrSubSampling', 'YResolution',
      # Orientation (whitelisted)
      'Orientation',
      # ICC Profile and Color Management (whitelisted)
      'BlueMatrixColumn', 'BlueTRC', 'CMMFlags', 'CMMType', 'ChromaticAdaptation',
      'ColorSpaceData', 'ConnectionSpaceIlluminant', 'DeviceAttributes',
      'DeviceManufacturer', 'DeviceMfgDesc', 'DeviceModel', 'DeviceModelDesc',
      'GamutVolume', 'GreenMatrixColumn', 'GreenTRC', 'ICCProfileName',
      'MeasurementAdaptation', 'MeasurementBacking', 'MeasurementFlare',
      'MeasurementGeometry', 'MeasurementIlluminant', 'MeasurementObserver',
      'MeasurementStandard', 'MediaWhitePoint', 'ProfileClass', 'ProfileCMMType',
      'ProfileConnectionSpace', 'ProfileCopyright', 'ProfileCreator', 'ProfileDateTime',
      'ProfileDescription', 'ProfileFileSignature', 'ProfileID', 'ProfileVersion',
      'RedMatrixColumn', 'RedTRC', 'RenderingIntent', 'Technology'
    ].map { |key| key.gsub(/\s+/, '') }.uniq.sort # Normalize to remove spaces for JSON keys
  end

  describe 'image processing' do
    around do |example|
      described_class.enable_processing = true
      example.run
      uploader.remove! if uploader.file
      described_class.enable_processing = false
    end

    let(:fixture_file_with_exif) { Rails.root.join('spec/fixtures/with_exif.jpeg').to_s }
    let(:fixture_file_with_orientation) { Rails.root.join('spec/fixtures/image_with_90_degree_exif_orientation.jpg').to_s }

    before do
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

      exiftool_output_json_str, stderr_str, status = Open3.capture3('exiftool', '-json', uploader.file.path)
      expect(status).to be_success, "exiftool command failed: #{stderr_str}. Output: #{exiftool_output_json_str}"
      exif_data = JSON.parse(exiftool_output_json_str).first # Get the first (and only) image's data
      actual_exiftool_json_keys = exif_data.keys.uniq.sort

      unexpected_tags = actual_exiftool_json_keys - allowed_exiftool_json_keys

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

  describe '#download!' do
    let(:user) { build(:user, avatar: nil) }
    let(:url) { 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1' }
    let(:jpeg) { file_fixture('female_avatar_0.jpg') }

    around do |example|
      AvatarUploader.enable_processing = true
      example.run
      user.avatar.remove! if user.avatar.file
      AvatarUploader.enable_processing = false
    end

    before do
      allow_any_instance_of(ProcessableUriDownloader).to receive(:skip_ssrf_protection?).and_return(true)
    end

    it 'names a JPEG served as image/avif after its content, so stripping succeeds' do
      stub_request(:get, url).to_return(body: jpeg.binread, headers: { 'Content-Type' => 'image/avif' })

      user.remote_avatar_url = url

      expect(user.avatar.file.filename).to eq('profilepic.jpg')
      expect(user.avatar.file.content_type).to eq('image/jpeg')
      expect(user.errors[:avatar]).to be_empty
    end

    it 'keeps the name when the content matches the declared type' do
      stub_request(:get, url).to_return(body: jpeg.binread, headers: { 'Content-Type' => 'image/jpeg' })

      user.remote_avatar_url = url

      expect(user.avatar.file.filename).to eq('profilepic.jpg')
    end

    it 'keeps the name when the detected type has no accepted extension' do
      # An AVIF with major brand mif1, which Marcel reads as image/heif.
      avif_header = [24].pack('N') + 'ftypmif1'.b + "\x00\x00\x00\x00".b + 'mif1avif'.b
      stub_request(:get, url).to_return(body: avif_header, headers: { 'Content-Type' => 'image/avif' })
      AvatarUploader.enable_processing = false

      user.remote_avatar_url = url

      expect(user.avatar.file.filename).to eq('profilepic.avif')
    end

    it 'still rejects content that is not an image' do
      stub_request(:get, url).to_return(body: '<html></html>', headers: { 'Content-Type' => 'image/avif' })

      user.remote_avatar_url = url

      expect(user).not_to be_valid
      expect(user.errors.details[:avatar]).to include(a_hash_including(error: :carrierwave_processing_error))
    end
  end

  describe '#strip' do
    around do |example|
      described_class.enable_processing = true
      example.run
      described_class.enable_processing = false
    end

    it 'raises a processing error when exiftool fails' do
      jpeg_named_avif = Tempfile.new(['jpeg', '.avif'])
      jpeg_named_avif.binmode
      jpeg_named_avif.write(file_fixture('female_avatar_0.jpg').binread)
      jpeg_named_avif.rewind
      allow(ErrorReporter).to receive(:report_msg)

      expect { uploader.cache!(jpeg_named_avif) }.to raise_error(CarrierWave::ProcessingError)
      expect(ErrorReporter).to have_received(:report_msg).with('Exiftool command failed during image stripping.', anything)
    ensure
      jpeg_named_avif.close!
    end
  end

  it 'whitelists exactly [image/jpg image/jpeg image/gif image/png image/webp]' do
    expect(uploader.extension_allowlist).to match_array %w[jpg jpeg gif png webp avif]
    expect(uploader.content_type_allowlist).to match_array %w[image/jpg image/jpeg image/gif image/png image/webp image/avif]
    expect(uploader.extension_denylist).to be_blank
    expect(uploader.content_type_denylist).to be_blank
  end
end

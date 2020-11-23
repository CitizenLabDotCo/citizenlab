class FaviconUploader < CarrierWave::Uploader::Base
  include BaseImageUploader
  include CarrierWave::MiniMagick

  version :large do
    process resize_to_fit: [152,152]
    process convert: :png
  end

  version :medium do
    process resize_to_fit: [32,32]
    process convert: :png
  end

  version :small do
    process resize_to_fit: [16,16]
    process convert: :png
  end

  def extension_whitelist
    %w(jpg jpeg gif png ico svg)
  end

end

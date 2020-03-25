class TextImageUploader < CarrierWave::Uploader::Base
  include BaseImageUploader

  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg gif png)
  end

end

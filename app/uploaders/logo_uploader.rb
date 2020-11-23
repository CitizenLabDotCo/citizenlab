class LogoUploader < CarrierWave::Uploader::Base
  include BaseImageUploader
  include CarrierWave::MiniMagick

  version :small do
    process resize_to_limit: [nil,40]
  end

  version :medium do
    process resize_to_limit: [nil,80]
  end

  version :large do
    process resize_to_limit: [nil,160]
  end

  def store_dir
    "uploads/#{Tenant.current.id}/logo/#{model.id}"
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg gif png)
  end

end

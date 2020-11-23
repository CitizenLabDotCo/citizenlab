class AppHeaderBgUploader < CarrierWave::Uploader::Base
  include BaseImageUploader
  include CarrierWave::MiniMagick

  version :large do
    process safe_resize_to_fill_for_gif: [1440,480]
  end

  version :medium do
    process safe_resize_to_fill_for_gif: [720,152]
  end

  version :small do
    process safe_resize_to_fill_for_gif: [520,250]
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg gif png)
  end

end

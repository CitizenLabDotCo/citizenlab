class ProjectImageUploader < CarrierWave::Uploader::Base
  include BaseUploader

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  # storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  # def store_dir
  #   "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  # end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process scale: [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process resize_to_fit: [50, 50]
  # end

  version :small do
    process resize_to_fill: [96, 96]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :medium do
    process resize_to_fill: [425,425]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :large do
    process resize_to_fit: [1200,1200]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg jpe jif jfif jfi jp2 jpf jpm jpx j2k jxr gif png tif tiff bmp pbm pgm ppm pnm webp heif heic ico tga sgi fits flif sid)
  end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end

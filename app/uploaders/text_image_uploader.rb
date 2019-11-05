class TextImageUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick

  if !Rails.env.test? && !Rails.env.development?
    storage :fog
  end

  def store_dir
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # We're not caching, since the external image optimization process will
  # quickly generate a new version that should replace this one asap
  def fog_attributes
    {'Cache-Control' => 'no-cache'}
  end

  # from https://github.com/carrierwaveuploader/carrierwave/wiki/how-to:-create-random-and-unique-filenames-for-all-versioned-files#unique-filenames
  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg gif png)
  end


  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

end

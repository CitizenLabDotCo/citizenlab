module BaseUploader
  extend ActiveSupport::Concern

  included do
    if !Rails.env.test? && !Rails.env.development?
      storage :fog
    end
  end

  def store_dir
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  unless Rails.env.test?
    def asset_host
      Tenant.current.base_backend_uri
    end
  end

  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end

  protected
  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

end

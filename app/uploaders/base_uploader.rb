module BaseUploader
  extend ActiveSupport::Concern

  included do
    if !Rails.env.test? && !Rails.env.development?
      storage :fog
    end
  end

  class_methods do
  end

  def store_dir
    # tenant = Apartment::Tenant.current
    # "uploads/#{tenant}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  unless Rails.env.test?
    def asset_host
      Tenant.current.base_backend_uri
    end
  end

end

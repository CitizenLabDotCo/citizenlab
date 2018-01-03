module BaseUploader
  extend ActiveSupport::Concern

  included do
    include CarrierWave::ImageOptimizer
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

  if Rails.env.development?
    def asset_host
      "http://localhost:4000"
    end
  end

end

module BaseUploader
  extend ActiveSupport::Concern

  included do
    unless Rails.env.test?
      storage :fog
    end
  end

  class_methods do
  end

  def store_dir
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

end

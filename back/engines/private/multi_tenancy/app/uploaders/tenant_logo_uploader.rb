class TenantLogoUploader < BaseImageUploader

  def store_dir
    tenant = model
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  version :small do
    process resize_to_limit: [nil,40]
  end

  version :medium do
    process resize_to_limit: [nil,80]
  end

  version :large do
    process resize_to_limit: [nil,160]
  end

end

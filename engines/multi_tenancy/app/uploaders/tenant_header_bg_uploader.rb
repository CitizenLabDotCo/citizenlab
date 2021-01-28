class TenantHeaderBgUploader < BaseImageUploader

  def store_dir
    tenant = model
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  version :large do
    process safe_resize_to_fill_for_gif: [1440,480]
  end

  version :medium do
    process safe_resize_to_fill_for_gif: [720,152]
  end

  version :small do
    process safe_resize_to_fill_for_gif: [520,250]
  end

end

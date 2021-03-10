class AppHeaderBgUploader < BaseImageUploader

  def store_dir
    "uploads/#{model.tenant.id}/header-background/#{model.id}"
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

# frozen_string_literal: true

class AppHeaderBgUploader < BaseImageUploader
  def store_dir
    'uploads/header-background'
  end

  version :large do
    process safe_resize_to_fill_for_gif: [1920, 640]
  end

  version :medium do
    process safe_resize_to_fill_for_gif: [720, 152]
  end

  version :small do
    process safe_resize_to_fill_for_gif: [520, 250]
  end
end

AppHeaderBgUploader.prepend_if_ee('MultiTenancy::Patches::AppHeaderBgUploader')

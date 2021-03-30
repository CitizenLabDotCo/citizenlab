# frozen_string_literal: true

class LogoUploader < BaseImageUploader
  def store_dir
    'uploads/logo'
  end

  version :small do
    process resize_to_limit: [nil, 40]
  end

  version :medium do
    process resize_to_limit: [nil, 80]
  end

  version :large do
    process resize_to_limit: [nil, 160]
  end
end

LogoUploader.prepend_if_ee('MultiTenancy::Patches::LogoUploader')

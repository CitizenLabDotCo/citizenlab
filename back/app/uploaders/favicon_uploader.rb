# frozen_string_literal: true

class FaviconUploader < BaseImageUploader
  def store_dir
    'uploads/favicon'
  end

  version :large do
    process resize_to_fit: [152, 152]
    process convert: :png
  end

  version :medium do
    process resize_to_fit: [32, 32]
    process convert: :png
  end

  version :small do
    process resize_to_fit: [16, 16]
    process convert: :png
  end

  def extension_allowlist
    %w[jpg jpeg gif png ico svg]
  end
end

FaviconUploader.prepend_if_ee('MultiTenancy::Patches::FaviconUploader')

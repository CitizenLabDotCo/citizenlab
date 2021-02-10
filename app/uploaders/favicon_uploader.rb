class FaviconUploader < BaseImageUploader

  def store_dir
    "uploads/#{model.tenant.id}/favicon/#{model.id}"
  end
  
  version :large do
    process resize_to_fit: [152,152]
    process convert: :png
  end

  version :medium do
    process resize_to_fit: [32,32]
    process convert: :png
  end

  version :small do
    process resize_to_fit: [16,16]
    process convert: :png
  end

  def extension_whitelist
    %w(jpg jpeg gif png ico svg)
  end

end

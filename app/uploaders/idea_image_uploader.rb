class IdeaImageUploader < BaseImageUploader

  version :small do
    process resize_to_fill: [96, 96]
  end

  version :medium do
    process resize_to_fill: [298,135]
  end

  version :large do
    process resize_to_limit: [480,nil]
  end

  version :fb do
    process resize_to_fill: [1200, 630]
  end

  def extension_whitelist
    %w(jpg jpeg gif png bmp)
  end

end

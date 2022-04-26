class InitiativeImageUploader < BaseImageUploader
  version :small do
    process resize_to_fill: [96, 96]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :medium do
    process resize_to_fill: [298, 135]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :large do
    process resize_to_limit: [480, nil]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :fb do
    process resize_to_fill: [1200, 630]
  end

  def extension_allowlist
    %w(jpg jpeg gif png bmp)
  end
end

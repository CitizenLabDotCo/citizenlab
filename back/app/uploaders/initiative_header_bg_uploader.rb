class InitiativeHeaderBgUploader < BaseImageUploader

  version :large do
    process resize_to_fill: [1440,360]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :medium do
    process resize_to_fill: [720,160]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :small do
    process resize_to_fill: [520,250]
    # process optimize: [{ quality: 90, quiet: true }]
  end

end

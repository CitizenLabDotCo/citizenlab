class ProjectHeaderBgUploader < BaseImageUploader

  version :large do
    process resize_to_fill: [1440,360]
  end

  version :medium do
    process resize_to_fill: [720,180]
  end

  version :small do
    process resize_to_fill: [520,250]
  end

end

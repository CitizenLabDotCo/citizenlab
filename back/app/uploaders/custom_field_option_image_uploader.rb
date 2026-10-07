# frozen_string_literal: true

class CustomFieldOptionImageUploader < BaseImageUploader
  version :small do
    process resize_to_fill: [96, 96]
    process :compress
  end

  version :medium do
    process resize_to_fill: [480, 217]
    process :compress
  end

  version :large do
    process resize_to_limit: [960, nil]
    process :compress
  end

  version :fb do
    process resize_to_fill: [1200, 630]
    process :compress
  end
end

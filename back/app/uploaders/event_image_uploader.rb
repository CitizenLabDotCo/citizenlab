# frozen_string_literal: true

class EventImageUploader < BaseImageUploader
  version :small do
    process resize_to_limit: [96, nil]
  end

  version :medium do
    process resize_to_limit: [480, nil]
  end

  version :large do
    process resize_to_limit: [960, nil]
  end

  version :fb do
    process resize_to_limit: [1200, nil]
  end
end

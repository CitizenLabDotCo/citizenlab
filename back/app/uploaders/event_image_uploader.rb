# frozen_string_literal: true

class EventImageUploader < BaseImageUploader
  version :small do
    process resize_to_fill: [96, 96]
  end
  
  version :medium do
    process resize_to_fill: [480, 217]
  end
  
  version :large do
    process resize_to_limit: [960, nil]
  end
  
  version :fb do
    process resize_to_fill: [1200, 630]
  end
end

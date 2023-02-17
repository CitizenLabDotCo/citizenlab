# frozen_string_literal: true

class ProjectHeaderBgUploader < BaseImageUploader
  version :large do
    process resize_to_fill: [1440, 360]
  end
end

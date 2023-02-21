# frozen_string_literal: true

class ProjectImageUploader < BaseImageUploader
  version :large do
    process safe_resize_to_fill_for_gif: [600, 450]
  end
end

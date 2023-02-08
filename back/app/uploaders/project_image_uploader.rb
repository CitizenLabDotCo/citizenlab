# frozen_string_literal: true

class ProjectImageUploader < BaseImageUploader
  # used for small cards on desktop
  version :small do
    process safe_resize_to_fill_for_gif: [400, 300]
  end

  version :large do
    process safe_resize_to_fill_for_gif: [600, 450]
  end
end

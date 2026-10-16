# frozen_string_literal: true

class TextImageUploader < BaseImageUploader
  # Rich text shows the original image, as there are no versions.
  process :limit_size
end

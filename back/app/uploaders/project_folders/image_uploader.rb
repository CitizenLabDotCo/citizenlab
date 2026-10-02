# frozen_string_literal: true

module ProjectFolders
  class ImageUploader < BaseImageUploader
    # used for small cards on desktop
    version :small do
      process safe_resize_to_fill_for_gif: [400, 300]
      process :compress
    end

    version :large do
      process safe_resize_to_fill_for_gif: [600, 450]
      process :compress
    end
  end
end

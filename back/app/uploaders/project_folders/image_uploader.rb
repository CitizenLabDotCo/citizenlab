# frozen_string_literal: true

module ProjectFolders
  class ImageUploader < BaseImageUploader
    # used for small cards on desktop
    version :small do
      process safe_resize_to_fill_for_gif: [520, 390]
    end

    # used for mobile
    version :medium do
      process safe_resize_to_fill_for_gif: [520, 390]
    end

    # used for large and medium cards on desktop
    version :large do
      process safe_resize_to_fill_for_gif: [520, 390]
    end
  end
end

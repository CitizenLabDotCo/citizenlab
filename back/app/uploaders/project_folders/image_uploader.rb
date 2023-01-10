# frozen_string_literal: true

module ProjectFolders
  class ImageUploader < BaseImageUploader
    version :medium do
      process safe_resize_to_fill_for_gif: [300, 150]
    end

    version :large do
      process safe_resize_to_fill_for_gif: [740, 370]
    end
  end
end

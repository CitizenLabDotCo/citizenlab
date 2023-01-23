# frozen_string_literal: true

module ProjectFolders
  class ImageUploader < BaseImageUploader
    version :small do
      process safe_resize_to_fill_for_gif: [96, 96]
    end

    version :medium do
      process safe_resize_to_fill_for_gif: [575, 575]
    end

    version :large do
      process safe_resize_to_fill_for_gif: [1200, 1200]
    end
  end
end

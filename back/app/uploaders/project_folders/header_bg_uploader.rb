# frozen_string_literal: true

module ProjectFolders
  class HeaderBgUploader < BaseImageUploader
    version :large do
      process resize_to_fill: [1440, 360]
      process :compress
    end

    version :medium do
      process resize_to_fill: [720, 180]
      process :compress
    end

    version :small do
      process resize_to_fill: [520, 250]
      process :compress
    end
  end
end

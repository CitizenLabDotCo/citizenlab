# frozen_string_literal: true

# Uploads a header background image in large, medium, small sizes.
class HeaderBgUploader < BaseImageUploader
  version :large do
    process safe_resize_to_fill_for_gif: [1920, 640]
  end

  version :medium do
    process safe_resize_to_fill_for_gif: [720, 152]
  end

  version :small do
    process safe_resize_to_fill_for_gif: [520, 250]
  end
end

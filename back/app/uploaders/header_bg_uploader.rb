# frozen_string_literal: true

# Uploads a header background image in large, medium, small sizes and stores them in a directory based on the
# AppConfiguration id and model id.
class HeaderBgUploader < BaseImageUploader
  def store_dir
    File.join('uploads', AppConfiguration.instance.id, 'header-background', model.id)
  end

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

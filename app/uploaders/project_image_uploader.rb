class ProjectImageUploader < BaseImageUploader

  version :small do
    process safe_resize_to_fill_for_gif: [96, 96]
  end

  version :medium do
    process safe_resize_to_fill_for_gif: [575,575]
  end

  version :large do
    process safe_resize_to_fill_for_gif: [1200,1200]
  end

  def extension_whitelist
    %w(jpg jpeg jpe jif jfif jfi jp2 jpf jpm jpx j2k jxr gif png tif tiff bmp pbm pgm ppm pnm webp heif heic ico tga sgi fits flif sid svg)
  end

end

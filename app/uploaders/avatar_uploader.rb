class AvatarUploader < BaseImageUploader

  version :small do
    process resize_to_fill: [32,32]
  end

  version :medium do
    process resize_to_fill: [200,200]
  end

  version :large do
    process resize_to_fill: [640,640]
  end

end

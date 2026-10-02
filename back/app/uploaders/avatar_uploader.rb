# frozen_string_literal: true

class AvatarUploader < BaseImageUploader
  version :small do
    process resize_to_fill: [32, 32]
    process :compress
  end

  version :medium do
    process resize_to_fill: [200, 200]
    process :compress
  end

  version :large do
    process resize_to_fill: [640, 640]
    process :compress
  end

  def content_type_allowlist
    nil # This is necessary to keep registration through SSO working.
  end
end

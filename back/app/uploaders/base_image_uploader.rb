# frozen_string_literal: true

class BaseImageUploader < BaseUploader
  include CarrierWave::MiniMagick

  ALLOWED_TYPES = %w[jpg jpeg gif png webp]

  # Using process at the class level applies it to all versions, including the original.
  process :strip

  # We're not caching, since the external image optimization process will
  # quickly generate a new version that should replace this one asap
  def fog_attributes
    { 'Cache-Control' => 'no-cache' }
  end

  # from https://github.com/carrierwaveuploader/carrierwave/wiki/how-to:-create-random-and-unique-filenames-for-all-versioned-files#unique-filenames
  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end

  def content_type_allowlist
    ALLOWED_TYPES.map { "image/#{_1}" }
  end

  def extension_allowlist
    ALLOWED_TYPES
  end

  def url(*)
    CarrierwaveTempRemote.url(identifier, version_name) || super
  end

  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

  # Modified from https://vivianbrown.net/blog/cropping-gifs.html
  def safe_resize_to_fill_for_gif(width, height)
    if @file.content_type == 'image/gif'
      gif_safe_transform! do |img|
        resize_to_fill_using_convert(img, width, height)
      end
    else
      resize_to_fill(width, height)
    end
  end

  def gif_safe_transform!
    MiniMagick::Tool::Convert.new do |image| # Calls imagemagick's "convert" command
      image << @file.path
      image.coalesce # Remove optimizations so each layer shows the full image.

      yield image

      image << @file.path
    end
  end

  def resize_to_fill_using_convert(img, target_width, target_height, gravity = 'Center')
    current_image = MiniMagick::Image.open(@file.path)
    current_width = current_image.width
    current_height = current_image.height
    if target_width != current_width || target_height != current_height
      scale_x = target_width / current_width.to_f
      scale_y = target_height / current_height.to_f
      if scale_x >= scale_y
        current_width = (scale_x * (current_width + 0.5)).round
        current_height = (scale_x * (current_height + 0.5)).round
        img.resize current_width
      else
        current_width = (scale_y * (current_width + 0.5)).round
        current_height = (scale_y * (current_height + 0.5)).round
        img.resize "x#{current_height}"
      end
    end
    img.gravity gravity
    img.background 'rgba(255,255,255,0.0)'
    img.extent "#{target_width}x#{target_height}" if current_width != target_width || current_height != target_height
  end

  # Strip the image of any profiles, comments or these PNG chunks: bKGD,cHRM,EXIF,gAMA,
  # iCCP,iTXt,sRGB,tEXt,zCCP,zTXt,date.
  # (https://imagemagick.org/script/command-line-options.php#strip)
  #
  # It is a bit heavy-handed and removes a lot of things, including colour profiles which
  # can have an effect on the image rendering. It also recompresses the image. Overall, it
  # seems to remove vibrancy from the image.
  def strip
    manipulate! do |img|
      img.strip
      img
    end
  end
end

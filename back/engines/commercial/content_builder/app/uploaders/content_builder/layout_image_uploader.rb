# frozen_string_literal: true

module ContentBuilder
  class LayoutImageUploader < BaseImageUploader
    SVG_CONTENT_TYPE = 'image/svg+xml'
    # Admins often upload photos straight from a camera (5000px+ wide, several MB).
    # No layout shows an image wider than this, even on high-density screens.
    MAX_SIZE = 2400
    QUALITY = 85

    process :sanitize_svg
    process :limit_size

    # Widgets such as the custom pages cards render layout images at icon size,
    # where a vector stays crisp on any screen density, so SVG is accepted here
    # on top of the raster formats every image uploader takes.
    def content_type_allowlist
      super + [SVG_CONTENT_TYPE]
    end

    def extension_allowlist
      super + ['svg']
    end

    protected

    # SVGs hold no EXIF metadata to strip, and exiftool cannot rewrite them.
    def strip
      return if svg?

      super
    end

    # See {ContentBuilder::SvgSanitizationService} for why this is needed.
    def sanitize_svg
      return unless svg?

      File.write @file.path, SvgSanitizationService.new.sanitize(File.read(@file.path))
    rescue SvgSanitizationService::InvalidSvgError => e
      # Surfaces as a validation error on the mounted attribute rather than a 500.
      raise CarrierWave::IntegrityError, e.message
    end

    def limit_size
      return if svg?

      width, height = ::MiniMagick::Image.new(current_path).dimensions
      return if width <= MAX_SIZE && height <= MAX_SIZE

      if @file.content_type == 'image/gif'
        gif_safe_transform! { |img| img.resize "#{MAX_SIZE}x#{MAX_SIZE}>" }
      else
        resize_to_limit(MAX_SIZE, MAX_SIZE, combine_options: { quality: QUALITY })
      end
    end

    private

    def svg?
      return false unless @file

      @file.content_type == SVG_CONTENT_TYPE || @file.extension.to_s.casecmp('svg').zero?
    end
  end
end

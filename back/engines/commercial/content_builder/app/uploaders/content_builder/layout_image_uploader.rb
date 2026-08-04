# frozen_string_literal: true

module ContentBuilder
  class LayoutImageUploader < BaseImageUploader
    SVG_CONTENT_TYPE = 'image/svg+xml'

    process :sanitize_svg

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

    private

    def svg?
      return false unless @file

      @file.content_type == SVG_CONTENT_TYPE || @file.extension.to_s.casecmp('svg').zero?
    end
  end
end

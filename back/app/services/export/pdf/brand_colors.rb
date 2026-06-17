# frozen_string_literal: true

module Export
  module Pdf
    # Builds the colour palette for the survey responses PDF from the tenant's
    # branding (color_main / color_secondary / color_text). Purely deterministic
    # derivations (tints/shades of the brand colours) — no contrast/luminance
    # logic.
    class BrandColors
      DEFAULT_PRIMARY = '#1E155D'
      DEFAULT_SECONDARY = '#FF3E52'
      DEFAULT_TEXT = '#1E155D'
      WHITE = '#FFFFFF'
      BLACK = '#000000'

      def self.palette
        new.palette
      end

      def initialize(configuration = AppConfiguration.instance)
        @primary = sanitize(configuration.settings('core', 'color_main'), DEFAULT_PRIMARY)
        @secondary = sanitize(configuration.settings('core', 'color_secondary'), DEFAULT_SECONDARY)
        @text = sanitize(configuration.settings('core', 'color_text'), DEFAULT_TEXT)
      end

      def palette
        {
          primary: @primary,
          secondary: @secondary,
          text: @text,
          text_muted: mix(@text, WHITE, 0.4),
          # Slightly darker primary for the cover eyebrow label.
          primary_dark: mix(@primary, BLACK, 0.2),
          # Slightly lighter primary for the cover divider line.
          primary_light: mix(@primary, WHITE, 0.25),
          # A light primary wash (10%) for the cover background.
          cover_bg: mix(@primary, WHITE, 0.9),
          # White foreground over the primary-coloured card headers.
          on_primary: WHITE,
          on_primary_muted: rgba(WHITE, 0.6),
          # Light primary derivatives for question bars, borders and fills.
          primary_tint: mix(@primary, WHITE, 0.92),
          primary_border: mix(@primary, WHITE, 0.82)
        }
      end

      private

      def sanitize(value, fallback)
        return fallback unless value.is_a?(String)

        hex = value.strip
        # Expand shorthand hex (e.g. "#333" -> "#333333").
        if hex.match?(/\A#[0-9a-fA-F]{3}\z/)
          hex = "##{hex.delete('#').chars.map { |c| c * 2 }.join}"
        end
        hex.match?(/\A#[0-9a-fA-F]{6}\z/) ? hex : fallback
      end

      def hex_to_rgb(hex)
        hex.delete('#').scan(/../).map { |pair| pair.to_i(16) }
      end

      def rgb_to_hex(rgb)
        format('#%02X%02X%02X', *rgb.map { |c| c.clamp(0, 255).round })
      end

      # Mix `weight` (0..1) of `b` into `a`.
      def mix(hex_a, hex_b, weight)
        a = hex_to_rgb(hex_a)
        b = hex_to_rgb(hex_b)
        rgb_to_hex(a.zip(b).map { |x, y| (x * (1 - weight)) + (y * weight) })
      end

      def rgba(hex, alpha)
        r, g, b = hex_to_rgb(hex)
        "rgba(#{r}, #{g}, #{b}, #{alpha})"
      end
    end
  end
end

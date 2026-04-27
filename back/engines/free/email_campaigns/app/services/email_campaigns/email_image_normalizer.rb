# frozen_string_literal: true

module EmailCampaigns
  # Normalizes <img> tags in campaign HTML so they render consistently across
  # email clients. The Quill editor + blot-formatter2 emits non-standard markup
  # (notably `width="270px"` and `height="auto"` as HTML attributes) that mail
  # clients interpret inconsistently. We rewrite each image to a canonical
  # form: a unitless HTML width attribute, a matching inline `width: Npx`
  # style, a `max-width: 100%` safety net, and `height: auto` to preserve the
  # aspect ratio. Floats are translated to margin-based alignment because
  # Outlook desktop renders floats unreliably.
  class EmailImageNormalizer
    def call(html)
      doc = Nokogiri::HTML.fragment(html)
      doc.css('img').each { |img| normalize!(img) }
      doc.to_s
    end

    private

    def normalize!(img)
      style = parse_inline_style(img['style'])

      apply_width_normalization!(img, style)
      apply_height_normalization!(img)
      convert_floats_to_margins!(style)

      style['max-width'] ||= '100%'
      style['height']    ||= 'auto'

      img['style'] = serialize_inline_style(style)
    end

    # Decides the canonical width:
    # 1. Inline `style="width: Npx"` wins (admin's saved value).
    # 2. Else parse the HTML width attribute (handles "270px" and "270").
    # 3. Express the result as both inline `width: Npx` (Gmail/Apple Mail)
    #    and a unitless HTML attribute (Outlook desktop).
    # Non-pixel widths (e.g. "50%") in the HTML attribute become inline style
    # only — the HTML attribute is dropped to avoid duplication.
    def apply_width_normalization!(img, style)
      style_value = style['width']
      attr_value  = img['width'].to_s

      if style_value.present?
        normalize_from_style!(img, style, style_value)
      else
        normalize_from_attr!(img, style, attr_value)
      end
    end

    def normalize_from_style!(img, style, value)
      px = pixel_value(value)
      if px
        style['width'] = "#{px}px"
        img['width'] = px.to_s
      else
        img.remove_attribute('width')
      end
    end

    def normalize_from_attr!(img, style, value)
      px = pixel_value(value)
      if px
        style['width'] = "#{px}px"
        img['width'] = px.to_s
      elsif value.match?(/\A\d+%\z/)
        style['width'] = value
        img.remove_attribute('width')
      else
        img.remove_attribute('width')
      end
    end

    # Drops invalid HTML `height` attributes (anything non-numeric, e.g.
    # "auto"). The CSS `height: auto` safety net is added by the caller.
    def apply_height_normalization!(img)
      return if img['height'].blank?
      return if img['height'].to_s.match?(/\A\d+\z/)

      img.remove_attribute('height')
    end

    # Translates left/right floats — unreliable in Outlook desktop — into
    # margin-based alignment. Quill blot-formatter's defaults are recognized
    # and replaced with margin-auto centering; custom margins are preserved.
    def convert_floats_to_margins!(style)
      float_value = style.delete('float')
      return unless %w[left right].include?(float_value)

      original_margin = style.delete('margin')
      style['display'] = 'block'
      style['margin'] = margin_for(float_value, original_margin)
    end

    def margin_for(float_value, original_margin)
      default_pattern = float_value == 'left' ? /\A0\s+1em\s+1em\s+0\z/ : /\A0\s+0\s+1em\s+1em\z/
      replacement     = float_value == 'left' ? '0 auto 1em 0' : '0 0 1em auto'

      return replacement if original_margin.nil? || original_margin.match?(default_pattern)

      original_margin
    end

    def parse_inline_style(raw)
      return {} if raw.blank?

      raw.split(';').each_with_object({}) do |declaration, acc|
        property, value = declaration.split(':', 2)
        next if property.nil? || value.nil?

        acc[property.strip.downcase] = value.strip
      end
    end

    def serialize_inline_style(style)
      style.map { |k, v| "#{k}: #{v}" }.join('; ')
    end

    def pixel_value(raw)
      match = raw.to_s.strip.match(/\A(\d+)\s*(?:px)?\z/)
      match && match[1].to_i
    end
  end
end

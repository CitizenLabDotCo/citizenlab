# frozen_string_literal: true

module ContentBuilder
  class HtmlBlockSanitizerService
    def sanitize(html)
      return '' if html.blank?

      sanitizer = Rails::HTML5::SafeListSanitizer.new
      # sanitize via the supplied tags and attributes
      sanitized = sanitizer.sanitize(
        html,
        tags: custom_tags,
        attributes: custom_attributes
      )

      if sanitized == html
        sanitized
      else
        sanitize(sanitized)
      end

      force_noopener(sanitized)
    end

    # Force rel="noopener noreferrer" on links with target="_blank"
    def force_noopener(html)
      return '' if html.blank?

      doc = Nokogiri::HTML::DocumentFragment.parse(html)
      doc.css('a[target="_blank"]').each do |node|
        node['rel'] = (node['rel'].to_s.split + %w(noopener noreferrer)).uniq.join(' ')
      end
      doc.to_html
    end

    # Custom tags and attributes for the sanitizer based on Loofah's whitelist
    # with some additions (media embeds) and removals (drop form).
    def custom_tags
      Loofah::HTML5::WhiteList::ALLOWED_ELEMENTS_WITH_LIBXML2 + %w[
        video audio source iframe
      ] - %w[form input button select textarea fieldset]
    end

    def custom_attributes
      Loofah::HTML5::WhiteList::ALLOWED_ATTRIBUTES + %w[
        frameborder allowfullscreen controls
      ] - %w[onerror]
    end
  end
end

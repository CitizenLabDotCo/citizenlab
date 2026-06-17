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

      force_noopener(sanitized)
    end

    # Force rel="noopener noreferrer" on links with target="_blank"
    def force_noopener(html)
      return '' if html.blank?

      doc = Nokogiri::HTML::DocumentFragment.parse(html)
      doc.css('a[target="_blank"]').each do |node|
        node['rel'] = 'noopener noreferrer'
      end
      doc.to_html
    end

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

# frozen_string_literal: true

module ContentBuilder
  class LayoutSanitizationService
    def sanitize(craftjson, text_features: %i[title alignment list decoration link image video])
      sanitize_html_in_text_elements craftjson, text_features
    end

    private

    def sanitize_html_in_text_elements(craftjson, features)
      LayoutService.new.select_craftjs_elements_for_types(craftjson, Layout::TEXT_CRAFTJS_NODE_TYPES).each do |elt|
        text_multiloc = elt.dig 'props', 'text'
        html_multiloc = elt.dig 'props', 'html'
        if text_multiloc.is_a?(Hash)
          text_multiloc.transform_values! do |text|
            html_sanitizer.sanitize text, features if text
          end
        elsif html_multiloc.is_a?(Hash)
          html_multiloc.transform_values! do |html|
            HtmlBlockSanitizer.new.sanitize(html) if html
          end
        end

      end
      craftjson
    end

    def html_sanitizer
      @html_sanitizer ||= ::SanitizationService.new
    end
  end
end

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
        text_multiloc.transform_values! do |text|
          html_sanitizer.sanitize text, features if text
        end
      end
      craftjson
    end

    def html_sanitizer
      @html_sanitizer ||= ::SanitizationService.new
    end
  end
end

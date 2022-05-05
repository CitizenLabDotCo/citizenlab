module ContentBuilder
  class LayoutSanitizationService < ::ContentImageService
    def sanitize(craftjson, text_features: %i[title alignment list decoration link image video])
      sanitize_html_in_text_elements craftjson, text_features
    end

    def sanitize_multiloc(multiloc, text_features: %i[title alignment list decoration link image video])
      multiloc.transform_values do |craftjson|
        sanitize craftjson, text_features: text_features
      end
    end

    private

    def sanitize_html_in_text_elements(craftjson, features)
      craftjson.each do |key, elt|
        next if key == 'ROOT' || elt.dig('type', 'resolvedName') != 'Text'

        text = elt.dig 'props', 'text'
        elt['props']['text'] = html_sanitizer.sanitize text, features if text
      end
      craftjson
    end

    def html_sanitizer
      @html_sanitizer ||= ::SanitizationService.new
    end
  end
end

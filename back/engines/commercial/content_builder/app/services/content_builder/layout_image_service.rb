module ContentBuilder
  class LayoutImageService
    protected

    def image_elements(content)
      content.select do |key, elt|
        key != 'ROOT' && elt.dig('type', 'resolvedName') == 'Image'
      end.values
    end

    def content_image_class
      LayoutImage
    end

    def image_attributes(img_elt, _, _)
      { remote_image_url: img_elt[image_attribute] }
    end

    def code_attribute_for_element
      'data-code'
    end
  end
end

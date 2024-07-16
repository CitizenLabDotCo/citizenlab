# frozen_string_literal: true

module ContentBuilder
  class LayoutImageService < ::ContentImageService
    IMAGE_ELEMENT_TYPES = %w[ImageMultiloc HomepageBanner]

    def image_elements(content)
      LayoutService.new.select_craftjs_elements_for_types(content, IMAGE_ELEMENT_TYPES).filter_map do |elt|
        elt.dig('props', 'image')
      end
    end

    protected

    def content_image_class
      LayoutImage
    end

    def image_attributes(img_elt, _imageable, _field)
      img_elt['imageUrl'].present? && { remote_image_url: img_elt['imageUrl'] }
    end

    def image_attributes_for_element
      %w[imageUrl versions]
    end

    def code_attribute_for_element
      'dataCode'
    end

    def set_image_attributes!(img_elt, content_image)
      img_elt['imageUrl'] = content_image.image.url
      # TODO: add versions
    end
  end
end

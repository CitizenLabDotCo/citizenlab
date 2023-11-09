# frozen_string_literal: true

module ContentBuilder
  class LayoutImageService < ::ContentImageService
    IMAGE_ELEMENT_TYPES = %w[MultilocImage HomepageBanner]

    protected

    def image_elements(content)
      LayoutService.new.select_craftjs_elements_for_type(content, IMAGE_ELEMENT_TYPES).pluck('props').pluck('image')
    end

    def content_image_class
      LayoutImage
    end

    def image_attributes(img_elt, _imageable, _field)
      { remote_image_url: img_elt['default'] }
    end

    def image_attributes_for_element
      %w[default versions]
    end

    def code_attribute_for_element
      'code'
    end

    def set_image_attributes!(img_elt, content_image)
      img_elt['default'] = content_image.image.url
      # TODO: add versions
    end
  end
end

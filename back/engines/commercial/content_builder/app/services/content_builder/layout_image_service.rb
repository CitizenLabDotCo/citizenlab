# frozen_string_literal: true

module ContentBuilder
  class LayoutImageService < ::ContentImageService
    protected

    def image_elements(content)
      LayoutService.new.select_craftjs_elements_for_type(content, 'Image').pluck('props')
    end

    def content_image_class
      LayoutImage
    end

    def image_attributes(img_elt, _imageable, _field)
      { remote_image_url: img_elt[image_attribute_for_element] }
    end

    def image_attribute_for_element
      'imageUrl'
    end

    def code_attribute_for_element
      'dataCode'
    end
  end
end

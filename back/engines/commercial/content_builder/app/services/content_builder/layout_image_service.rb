# frozen_string_literal: true

module ContentBuilder
  class LayoutImageService < ::ContentImageService
    # Widgets holding a single image, under an `image` prop.
    IMAGE_ELEMENT_TYPES = %w[ImageMultiloc HomepageBanner]
    # The CustomPages widget holds one optional icon image per selected page, so its
    # images sit under `image` keys nested in its `customPages` prop instead.
    CUSTOM_PAGES_ELEMENT_TYPE = 'CustomPages'

    def image_elements(content)
      layout_service = LayoutService.new

      single_images = layout_service.select_craftjs_elements_for_types(content, IMAGE_ELEMENT_TYPES).filter_map do |elt|
        elt.dig('props', 'image')
      end

      nested_images = layout_service
        .select_craftjs_elements_for_types(content, [CUSTOM_PAGES_ELEMENT_TYPE])
        .flat_map { |elt| custom_page_images(elt) }

      single_images + nested_images
    end

    protected

    def custom_page_images(elt)
      pages = elt.dig('props', 'customPages')
      return [] unless pages.is_a?(Array)

      pages.filter_map { |page| page['image'].presence if page.is_a?(Hash) }
    end

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

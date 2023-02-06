# frozen_string_literal: true

module ContentBuilder
  class LayoutService
    def select_craftjs_elements_for_type(craftjs, type)
      craftjs.select do |key, elt|
        key != 'ROOT' && craftjs_element_of_type?(elt, type)
      end.values
    end

    def craftjs_element_of_type?(elt, type)
      elt.is_a?(Hash) && elt['type'].is_a?(Hash) && elt.dig('type', 'resolvedName') == type
    end

    def images(layout)
      layout_image_codes = []

      layout.craftjs_jsonmultiloc.each_key do |locale|
        layout.craftjs_jsonmultiloc[locale].each_value do |node|
          next unless craftjs_element_of_type?(node, 'Image')

          layout_image_codes << node['props']['dataCode']
        end
      end

      LayoutImage.where(code: layout_image_codes)
    end
  end
end

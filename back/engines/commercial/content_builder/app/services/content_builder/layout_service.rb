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
  end
end

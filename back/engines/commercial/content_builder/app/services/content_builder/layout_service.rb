# frozen_string_literal: true

module ContentBuilder
  class LayoutService
    def select_craftjs_elements_for_types(craftjs, types)
      craftjs.select do |key, elt|
        key != 'ROOT' && craftjs_element_of_types?(elt, types)
      end.values
    end

    def craftjs_element_of_types?(elt, types)
      elt.is_a?(Hash) && elt['type'].is_a?(Hash) && types.include?(elt.dig('type', 'resolvedName'))
    end

    def delete_admin_pub_ids_from_homepage_layout(id_or_array_of_ids)
      homepage_layout = ContentBuilder::Layout.find_by(code: 'homepage')
      return unless homepage_layout

      ids = id_or_array_of_ids.is_a?(Array) ? id_or_array_of_ids : [id_or_array_of_ids]

      homepage_layout.craftjs_json = homepage_layout.craftjs_json.each_value do |node|
        next unless node['type']['resolvedName'] == 'Selection'

        ids.each { |id| node['props']['adminPublicationIds'].delete(id) }
      end

      homepage_layout.save!
    end
  end
end

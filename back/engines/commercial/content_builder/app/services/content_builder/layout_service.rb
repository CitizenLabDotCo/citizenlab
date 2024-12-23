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

    def clean_homepage_layout_when_publication_deleted(publication)
      homepage_layout = ContentBuilder::Layout.find_by(code: 'homepage')
      return unless homepage_layout

      remove_admin_publication_id_from_homepage_layout(publication, homepage_layout)
      remove_spotlight_widgets_for_publication(publication, homepage_layout)
    end

    private

    def remove_admin_publication_id_from_homepage_layout(publication, homepage_layout)
      admin_publication_id = publication.admin_publication.id

      homepage_layout.craftjs_json = homepage_layout.craftjs_json.each_value do |node|
        next unless node['type']['resolvedName'] == 'Selection'

        node['props']['adminPublicationIds'].delete(admin_publication_id)
      end

      homepage_layout.save!
    end

    def remove_spotlight_widgets_for_publication(publication, homepage_layout)
      publication_id = publication.id

      homepage_layout.craftjs_json.each do |key, node|
        next unless node['type']['resolvedName'] == 'Spotlight'

        # Delete the key-node pair, and the reference to it, if it's a spotlight widget for the publication
        if node['props']['publicationId'] == publication_id
          homepage_layout.craftjs_json.delete(key)
          homepage_layout.craftjs_json['ROOT']['nodes'].delete(key)
        end
      end

      homepage_layout.save!
    end
  end
end

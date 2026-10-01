# frozen_string_literal: true

module ContentBuilder
  class LayoutService
    # Layouts that can hold the Spotlight and Selection widgets, which point at projects and folders.
    PUBLICATION_WIDGET_LAYOUT_CODES = [
      Layout::HOMEPAGE_CODE,
      CustomPageLayoutService::CODE,
      LayoutProvisioningService::FOLDER_LAYOUT_CODE
    ].freeze

    def select_craftjs_elements_for_types(craftjs, types)
      craftjs.select do |key, elt|
        key != 'ROOT' && craftjs_element_of_types?(elt, types)
      end.values
    end

    def craftjs_element_of_types?(elt, types)
      elt.is_a?(Hash) && elt['type'].is_a?(Hash) && types.include?(elt.dig('type', 'resolvedName'))
    end

    # Removes Spotlight widgets showing the deleted project or folder, and drops it from Selection widgets.
    def clean_layouts_when_publication_deleted(publication)
      admin_publication_id = publication.admin_publication.id

      Layout
        .where(code: PUBLICATION_WIDGET_LAYOUT_CODES)
        .with_widget_type('Spotlight', 'Selection')
        .find_each do |layout|
          json = layout.craftjs_json.deep_dup
          remove_spotlights_for_publication(json, publication.id)
          remove_from_selections(json, admin_publication_id)
          next if json == layout.craftjs_json

          # update_column: this runs while a project or folder is being deleted, and an unrelated
          # widget failing validation must not be able to block that deletion.
          layout.update_column(:craftjs_json, json)
        end
    end

    private

    def remove_spotlights_for_publication(json, publication_id)
      state = Craftjs::State.new(json)
      state.nodes_by_resolved_name('Spotlight').each do |id, node|
        next unless node.dig('props', 'publicationId') == publication_id

        # A stored graph may reference a parent it no longer holds; drop the node alone then.
        json.key?(node['parent']) ? state.delete_node(id) : json.delete(id)
      end
    end

    def remove_from_selections(json, admin_publication_id)
      Craftjs::State.new(json).nodes_by_resolved_name('Selection').each_value do |node|
        ids = node.dig('props', 'adminPublicationIds')
        ids.delete(admin_publication_id) if ids.is_a?(Array)
      end
    end
  end
end

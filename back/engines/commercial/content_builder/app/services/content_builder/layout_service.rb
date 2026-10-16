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
          remove_widgets(json, 'Spotlight', 'publicationId', publication.id)
          remove_from_selections(json, admin_publication_id)
          next if json == layout.craftjs_json

          # update_column: this runs while a project or folder is being deleted, and an unrelated
          # widget failing validation must not be able to block that deletion.
          layout.update_column(:craftjs_json, json)
        end
    end

    def clean_project_page_when_survey_phase_removed(phase)
      layout = Layout.find_by(
        content_buildable_type: 'Project',
        content_buildable_id: phase.project_id,
        code: ProjectPageLayoutService::CODE
      )
      return if layout.nil?

      json = layout.craftjs_json.deep_dup
      remove_widgets(json, 'ExtraSurveysWidget', 'surveyPhaseId', phase.id)
      return if json == layout.craftjs_json

      # update_column: an unrelated widget failing validation must not leave this one behind.
      layout.update_column(:craftjs_json, json)
    end

    private

    def remove_widgets(json, resolved_name, id_prop, id)
      state = Craftjs::State.new(json)
      state.nodes_by_resolved_name(resolved_name).each do |node_id, node|
        next unless node.dig('props', id_prop) == id

        # A stored graph may reference a parent it no longer holds; drop the node alone then.
        json.key?(node['parent']) ? state.delete_node(node_id) : json.delete(node_id)
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

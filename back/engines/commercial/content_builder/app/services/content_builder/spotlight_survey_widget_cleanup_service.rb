# frozen_string_literal: true

module ContentBuilder
  # An ExtraSurveysWidget can only point at a standalone survey phase. Once that phase
  # moves onto the timeline or is deleted the widget has nothing left to render, so it is
  # dropped from the project page rather than left behind as a blank slot.
  class SpotlightSurveyWidgetCleanupService
    WIDGET = 'ExtraSurveysWidget'
    PHASE_PROP = 'surveyPhaseId'

    def cleanup_moved(phase)
      return unless phase.placement_type_previously_changed?
      return unless phase.on_timeline?

      cleanup(phase)
    end

    def cleanup_destroyed(phase)
      cleanup(phase)
    end

    private

    def cleanup(phase)
      project = phase.project
      return if project.nil?

      layout = Layout.find_by(content_buildable: project, code: ProjectPageLayoutService::CODE)
      return if layout.nil?

      remove_widgets_for(layout, phase.id)
    rescue StandardError => e
      # The phase has already moved or gone. A layout we cannot edit (Craftjs::State raises
      # on an inconsistent graph) leaves a widget behind, which is better than failing the
      # request that got us here.
      ErrorReporter.report(e, extra: { phase_id: phase.id })
    end

    def remove_widgets_for(layout, phase_id)
      state = Craftjs::State.new(layout.craftjs_json)
      node_ids = state.nodes_by_resolved_name(WIDGET)
        .select { |_id, node| node.dig('props', PHASE_PROP) == phase_id }
        .keys
      return if node_ids.empty?

      node_ids.each { |node_id| state.delete_node(node_id) }
      layout.update!(craftjs_json: state.json)
    end
  end
end

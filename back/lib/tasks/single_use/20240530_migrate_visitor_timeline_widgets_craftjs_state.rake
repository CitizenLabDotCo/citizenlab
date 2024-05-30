# frozen_string_literal: true

namespace :single_use do
  task migrate_visitor_timeline_widgets_craftjs_state: :environment do
    # region HELPER METHODS
    def migrate_layout(layout)
      state = ContentBuilder::Craftjs::State.new(layout.craftjs_json)
      widget_nodes = state.nodes_by_resolved_name('VisitorsWidget')

      updated = widget_nodes.any? do |_node_id, node|
        next false unless node['props'].key?('projectId')

        node['props'].delete('projectId')
        true
      end

      layout.save! if updated
    end
    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('VisitorsWidget')

        layouts.each { |layout| migrate_layout(layout) }
      end
    end
  end
end

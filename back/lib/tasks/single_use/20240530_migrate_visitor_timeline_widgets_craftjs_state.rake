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

      if updated
        layout.save!

        if layout.content_buildable_type == 'ReportBuilder::Report'
          report = layout.content_buildable
          user = report.owner || User.super_admins.first || User.admins.first
          ReportBuilder::ReportPublisher.new(report, user).publish
        end
      end
    end
    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('VisitorsWidget')
          .preload(content_buildable: :owner)

        layouts.each do |layout|
          Rails.logger.info(
            'migrate_visitor_timeline_widgets_craftjs_state',
            tenant_id: tenant.id,
            tenant_host: tenant.host,
            layout_id: layout.id
          )

          migrate_layout(layout)
        end
      end
    end
  end
end

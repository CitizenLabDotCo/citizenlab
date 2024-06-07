# frozen_string_literal: true

namespace :single_use do
  task migrate_deprecated_participation_widgets: :environment do
    # region HELPER METHODS
    def migrate_layout(layout)
      state = ContentBuilder::Craftjs::State.new(layout.craftjs_json)

      widget_nodes = [
        *state.nodes_by_resolved_name('PostsByTimeWidget').values,
        *state.nodes_by_resolved_name('CommentsByTimeWidget').values
      ]

      widget_nodes.each do |node|
        resolved_name = node['type']['resolvedName']

        node['type']['resolvedName'] = 'ParticipationWidget'
        node['displayName'] = 'ParticipationWidget'
        node['props'].merge!(
          hideStatistics: true,
          participationTypes: {
            inputs: resolved_name == 'PostsByTimeWidget',
            comments: resolved_name == 'CommentsByTimeWidget',
            votes: false
          }
        )
      end

      layout.save!

      if layout.content_buildable_type == 'ReportBuilder::Report'
        report = layout.content_buildable
        user = report.owner || User.super_admins.first || User.admins.first
        ReportBuilder::ReportPublisher.new(report, user).publish
      end
    end
    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('CommentsByTimeWidget', 'PostsByTimeWidget')
          .preload(content_buildable: :owner)

        layouts.each do |layout|
          Rails.logger.info(
            'migrate_deprecated_participation_widgets',
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

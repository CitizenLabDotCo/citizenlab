# frozen_string_literal: true

namespace :single_use do
  task migrate_deprecated_custom_field_widgets: :environment do
    # region HELPER METHODS
    def migrate_layout(layout)
      state = ContentBuilder::Craftjs::State.new(layout.craftjs_json)

      widget_nodes = [
        *state.nodes_by_resolved_name('GenderWidget').values,
        *state.nodes_by_resolved_name('AgeWidget').values
      ]

      cf_ids = {
        'AgeWidget' => CustomField.find_by!(code: 'birthyear').id,
        'GenderWidget' => CustomField.find_by!(code: 'gender').id
      }

      widget_nodes.each do |node|
        resolved_name = node['type']['resolvedName']
        node['type']['resolvedName'] = 'DemographicsWidget'
        node['displayName'] = 'DemographicsWidget'
        node['props']['customFieldId'] = cf_ids[resolved_name]
      end

      ContentBuilder::Layout.transaction do
        layout.save!

        if layout.content_buildable_type == 'ReportBuilder::Report'
          # Refresh the report data
          republish_report(layout.content_buildable)
        end
      end
    end

    def republish_report(report)
      user = report.owner || User.super_admins.first || User.admins.first
      ReportBuilder::ReportPublisher.new(report, user).publish
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error(
        message: 'Cannot refresh report data',
        exception: e,
        report_id: report.id
      )
    end

    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('GenderWidget', 'AgeWidget')
          .preload(content_buildable: :owner)

        Rails.logger.tagged(
          task: 'migrate_deprecated_custom_field_widgets',
          tenant_id: tenant.id,
          tenant_host: tenant.host
        ) do
          layouts.each do |layout|
            Rails.logger.info('Layout migration', layout_id: layout.id)
            migrate_layout(layout)
          end
        end
      end
    end
  end
end

# Usage:
#
# Dry run: rake single_use:republish_traffic_sources_widgets
# Execute: rake single_use:republish_traffic_sources_widgets[execute]
namespace :single_use do
  desc 'Republish traffic sources widgets'
  task :republish_traffic_sources_widgets, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    def resolved_name(node)
      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    def republish_report(report, execute)
      user = report.owner || User.super_admins.first || User.admins.first

      if execute
        ReportBuilder::ReportPublisher.new(report, user).publish
      else
        puts "\nWould republish report: #{report.id}\n\n"
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error(
        message: 'Cannot refresh report data',
        exception: e,
        report_id: report.id
      )
    end

    def replace_published_data(report, execute)
      layout = report.layout

      layout.craftjs_json.dup.each do |(node_id, node)|
        next unless resolved_name(node) == 'VisitorsTrafficSourcesWidget'

        data_unit = ReportBuilder::PublishedGraphDataUnit
          .where(graph_id: node_id, report_id: report.id)
          .first

        if data_unit.present?
          new_data = {
            sessions_per_referrer_type: {},
            top_50_referrers: []
          }

          if execute
            puts "\nReplacing data in unit: #{data_unit.id}\n\n"
            # Replace data with empty data
            data_unit.data = new_data
            data_unit.save!
          else
            puts "\nWould replace data in unit: #{data_unit.id}\n\n"
          end
        end
      end
    end

    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      # 1. Get published reports
      published_reports = ReportBuilder::Report.where.not(
        phase_id: nil
      )

      # 2. Get layouts associated with reports
      published_layouts = ContentBuilder::Layout.where(
        content_buildable_type: 'ReportBuilder::Report',
        content_buildable_id: published_reports.pluck(:id)
      )

      # 3. Search published reports for VisitorsTrafficSourcesWidget.
      # If found, store report id
      report_ids = []

      published_layouts.each do |layout|
        layout.craftjs_json.dup.each do |(_node_id, node)|
          next unless resolved_name(node) == 'VisitorsTrafficSourcesWidget'

          # Add new 'view' prop
          node['props']['view'] = 'chart'
          puts "\nUpdated props in layout: #{layout.id}\n\n"

          # Add report id to list if not on there yet
          report_id = layout.content_buildable_id

          unless report_ids.include? report_id
            report_ids << report_id
          end
        end

        if layout.changed?
          if execute
            layout.save!
          else
            puts "\nWould save layout: #{layout.id}\n\n"
          end
        end
      end

      # 4. Loop over reports and republish them
      report_ids.each do |report_id|
        report = ReportBuilder::Report.find(report_id)

        phase = Phase.find(report.phase_id)

        if phase.nil?
          puts "\nReport #{report_id} phase was deleted. Replacing with empty placeholder data.\n\n"
          replace_published_data(report, execute)
        else
          puts "\nRepublishing report: #{report_id}\n\n"
          republish_report(report, execute)
        end
      end
    end
  end
end

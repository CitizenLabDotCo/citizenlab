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
      # If found: 
      # - add new default value for view prop 
      # - republish data unit
      published_layouts.each do |layout|
        report_id = layout.content_buildable_id

        layout.craftjs_json.dup.each do |(node_id, node)|
          next unless resolved_name(node) == 'VisitorsTrafficSourcesWidget'

          # Add new 'view' prop
          node['props']['view'] = 'chart'
          puts "\nUpdated props in layout: #{layout.id}\n\n"

          # Get report owner
          report = ReportBuilder::Report.find(report_id)
          user = report.owner || User.super_admins.first || User.admins.first

          # Find published data unit
          published_unit = ReportBuilder::PublishedGraphDataUnit
            .where(report_id: report_id, graph_id: node_id)
            .first

          # Create new data
          data = ReportBuilder::QueryRepository.new(user)
            .data_by_graph('VisitorsTrafficSourcesWidget', node['props'])

          next unless data

          # Delete published data unit
          published_unit.destroy

          # Create new data unit
          ReportBuilder::PublishedGraphDataUnit.create!(
            report_id: @report.id,
            graph_id: node_id,
            data: data
          )
        end

        if layout.changed?
          if execute
            layout.save!
          else
            puts "\nWould save layout: #{layout.id}\n\n"
          end
        end
      end
    end
  end
end

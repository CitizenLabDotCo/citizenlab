namespace :single_use do
  desc 'Update published participants data'
  task update_published_participants_data: :environment do
    def resolved_name(node)
      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      # 1. Get published reports
      published_reports = ReportBuilder::Report.where(
        "phase_id IS NOT NULL",
      )

      # 2. Get layouts associated with reports
      published_layouts = ContentBuilder::Layout.where(
        content_buildable_type: 'ReportBuilder::Report',
        content_buildable_id: published_reports.pluck(:id)
      )

      # 3. Search published report for ParticipantsWidgets and store graph_id
      graph_ids = []

      published_layouts.each do |layout|
        layout.craftjs_json.dup.each do |(node_id, node)|
          next unless resolved_name(node) == 'ParticipantsWidget'

          # The node_id is the graph_id
          # See back/engines/commercial/report_builder/app/services/report_builder/report_publisher.rb
          graph_ids << node_id
        end
      end

      # 4. Find graph data units using graph_id,
      # and update the structure
      data_units = ReportBuilder::PublishedGraphDataUnit
        .where(graph_id: graph_ids)

      data_units.each do |data_unit|
        # Check to confirm this data is an array,
        # meaning it has not been converted yet
        next unless data_unit.data.is_a?(Array)

        timeseries = data_unit.data[0].map do |row|
          {
            date_group: row[:first_dimension_date_created_date],
            participants: row[:count_participant_id]
          }
        end

        # TODO
      end
    end
  end
end

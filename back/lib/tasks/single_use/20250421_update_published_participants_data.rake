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

        participants_timeseries = data_unit.data[0].map do |row|
          {
            date_group: row["first_dimension_date_created_date"],
            participants: row["count_participant_id"]
          }
        end

        participants_whole_period = data_unit.data[1]["count_participant_id"]

        matomo_visitors_whole_period = data_unit.data[2]["count_visitor_id"]
        participants_filtered_by_matomo = data_unit.data[3]["count_participant_id"]

        participation_rate_whole_period = participants_filtered_by_matomo.to_f /
          matomo_visitors_whole_period.to_f

        # if compare period...
        if data_unit.data[4].is_a?(Hash) && data_unit.data[5].is_a?(Hash) && data_unit.data[6].is_a?(Hash)
          participants_compared_period = data_unit.data[4]["count_participant_id"]
          matomo_visitors_compared_period = data_unit.data[5]["count_visitor_id"]
          participants_filtered_by_matomo_compared = data_unit.data[6]["count_participant_id"]

          participation_rate_compared_period = participants_filtered_by_matomo_compared.to_f /
            matomo_visitors_compared_period.to_f
        end
      end
    end
  end
end

# Usage:
#
# Dry run: rake single_use:update_published_visitor_data
# Execute: rake single_use:update_published_visitor_data[execute]
namespace :single_use do
  desc 'Update published visitor data'
  task :update_published_visitor_data, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    def resolved_name(node)
      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    def floor_month(date_str)
      raise ArgumentError, 'Invalid date format' unless date_str.length == 10

      "#{date_str.slice(0, 8)}01"
    end

    def safe_get(entry, key)
      return 0 if entry.nil?

      inner = entry[0]
      return 0 unless inner.is_a?(Hash)

      value = inner[key]

      return value.to_f if value.is_a?(String)
      return 0 unless value.is_a?(Integer)

      value
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

      # 3. Search published report for VisitorsWidget and store graph_id
      graph_ids = []

      published_layouts.each do |layout|
        layout.craftjs_json.dup.each do |(node_id, node)|
          next unless resolved_name(node) == 'VisitorsWidget'

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

        visitors_timeseries = data_unit.data[0].map do |row|
          {
            date_group: floor_month(row['first_dimension_date_created_date']),
            visits: row['count'],
            visitors: row['count_monthly_user_hash']
          }
        end

        # Extract statistics
        visits_whole_period = safe_get(data_unit.data[1], 'count')
        visitors_whole_period = safe_get(data_unit.data[1], 'count_monthly_user_hash')
        avg_seconds_per_session_whole_period = safe_get(data_unit.data[2], 'avg_duration')
        avg_pages_visited_whole_period = safe_get(data_unit.data[2], 'avg_pages_visited')

        new_data = {
          'visitors_timeseries' => visitors_timeseries,
          'visits_whole_period' => visits_whole_period,
          'visitors_whole_period' => visitors_whole_period,
          'avg_seconds_per_session_whole_period' => avg_seconds_per_session_whole_period,
          'avg_pages_visited_whole_period' => avg_pages_visited_whole_period
        }

        # if compare period...
        if data_unit.data.length > 3
          # Extract statistics
          visits_compared_period = safe_get(data_unit.data[3], 'count')
          visitors_compared_period = safe_get(data_unit.data[3], 'count_monthly_user_hash')
          avg_seconds_per_session_compared_period = safe_get(data_unit.data[4], 'avg_duration')
          avg_pages_visited_compared_period = safe_get(data_unit.data[4], 'avg_pages_visited')

          new_data['visits_compared_period'] = visits_compared_period
          new_data['visitors_compared_period'] = visitors_compared_period
          new_data['avg_seconds_per_session_compared_period'] = avg_seconds_per_session_compared_period
          new_data['avg_pages_visited_compared_period'] = avg_pages_visited_compared_period
        end

        puts "\n\n"

        # Update the data if execute == true
        if execute
          data_unit.data = new_data
          data_unit.save!
          puts "Updated #{data_unit.graph_id}"
        else
          puts "Would update #{data_unit.graph_id}\n"
          puts "Old data:\n"
          puts data_unit.data.to_json
          puts "\n\n"
          puts "New data:\n"
          puts new_data.to_json
        end

        puts "\n\n"
      end
    end
  end
end

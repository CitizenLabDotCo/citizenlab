# Usage:
#
# Dry run: rake single_use:update_published_traffic_sources_data
# Execute: rake single_use:update_published_traffic_sources_data[execute]
namespace :single_use do
  desc 'Update published traffic sources data'
  task :update_published_traffic_sources_data, %i[execute] => [:environment] do |_t, args|
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
      # - convert data to new format
      # - add new default value for view prop
      published_layouts.each do |layout|
        report_id = layout.content_buildable_id

        layout.craftjs_json.dup.each do |(node_id, node)|
          next unless resolved_name(node) == 'VisitorsTrafficSourcesWidget'

          # Find published data unit
          data_unit = ReportBuilder::PublishedGraphDataUnit
            .where(report_id: report_id, graph_id: node_id)
            .first

          # Make sure it exists
          if data_unit.nil?
            raise 'ERROR: data unit not found'
          end

          # Skip unless data is in array format (if not, it is already converted)
          next unless data_unit.data.is_a?(Array)

          puts "\nold data:\n"
          puts data_unit.data
          puts "\n"

          sessions_per_referrer_type = {}

          data_unit.data.each do |row|
            old_name = row['first_dimension_referrer_type_name']
            count = row['count']

            case old_name
            when 'Direct Entry'
              sessions_per_referrer_type['direct_entry'] = count
            when 'Social Networks'
              sessions_per_referrer_type['social_network'] = count
            when 'Search Engines'
              sessions_per_referrer_type['search_engine'] = count
            when 'Websites', 'Campaigns'
              if sessions_per_referrer_type.key?('other')
                sessions_per_referrer_type['other'] += count
              else
                sessions_per_referrer_type['other'] = count
              end
            else
              raise 'ERROR: unknown first_dimension_referrer_type_name'
            end
          end

          new_data = {
            sessions_per_referrer_type: sessions_per_referrer_type,
            top_50_referrers: []
          }

          puts "\nnew data:\n"
          puts new_data
          puts "\n"

          if execute
            data_unit.data = new_data
            data_unit.save!
          else
            puts "Would save data unit: #{node_id}"
          end

          # Add new 'view' prop
          node['props']['view'] = 'chart'
          puts "\nUpdated props in layout: #{layout.id}\n\n"
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

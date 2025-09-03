# frozen_string_literal: true

namespace :single_use do
  desc 'Fix invalid HeatmapCell records due to floating point precision issues'
  task fix_heatmap_cells_precision_issues: :environment do
    report = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      next unless AppConfiguration.instance.feature_activated?('analysis')

      puts "Processing tenant #{tenant.host} ..."

      # Find and fix invalid HeatmapCells with lift or p_value precision issues
      Analysis::HeatmapCell.find_each do |cell|
        attributes_to_update = {}

        # Fix negative lift values
        if cell.lift.negative?
          attributes_to_update[:lift] = 0.0
          report.add_info(
            'Fixed negative lift value',
            context: {
              tenant: tenant.host,
              cell_id: cell.id,
              old_value: cell.lift,
              new_value: 0.0
            }
          )
        end

        # Fix p_value issues
        if cell.p_value.negative?
          attributes_to_update[:p_value] = 0.0
          report.add_info(
            'Fixed negative p_value',
            context: {
              tenant: tenant.host,
              cell_id: cell.id,
              old_value: cell.p_value,
              new_value: 0.0
            }
          )
        elsif cell.p_value > 1
          attributes_to_update[:p_value] = 1.0
          report.add_info(
            'Fixed p_value slightly above 1',
            context: {
              tenant: tenant.host,
              cell_id: cell.id,
              old_value: cell.p_value,
              new_value: 1.0
            }
          )
        end

        # Update the record if needed
        if attributes_to_update.present?
          begin
            cell.update!(attributes_to_update)
            report.add_update(
              'Analysis::HeatmapCell',
              attributes_to_update,
              context: { tenant: tenant.host, cell_id: cell.id }
            )
          rescue StandardError => e
            report.add_error(
              e.message,
              context: {
                tenant: tenant.host,
                cell_id: cell.id,
                attributes: attributes_to_update
              }
            )
          end
        end
      end

      report.add_processed_tenant(tenant)
    end

    report.report!('fix_heatmap_cells_precision_issues.json', verbose: true)
  end
end

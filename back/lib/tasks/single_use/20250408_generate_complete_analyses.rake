# frozen_string_literal: true

namespace :single_use do
  desc 'Make sure all participation contexts have a main analysis'
  # See https://www.notion.so/govocal/Change-the-model-to-support-a-a-main-analysis-that-works-for-surveys-1ce9663b7b26809faff3f73960382339?pvs=4
  task generate_complete_analyses: :environment do
    report = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      next unless AppConfiguration.instance.feature_activated?('analysis')

      puts "processing tenant #{tenant.host} ..."

      # Find all the phases that have analyses defined, but don't have an analysis with an empty 'main_custom_field'
      Phase
        .distinct
        .joins(:analyses)
        .where.not(analyses: { main_custom_field_id: nil })
        .find_each do |phase|
          next if phase.custom_form.nil? || phase.custom_form.custom_fields.empty?

          if (analysis = Analysis::Analysis.create(
            phase:,
            main_custom_field: nil,
            additional_custom_fields: phase.custom_form.custom_fields
          ))
            report.add_create(
              'Analysis::Analysis',
              analysis.attributes,
              context: { tenant: tenant.host, phase_id: phase.id }
            )
          else
            report.add_error(
              analysis.errors.details,
              context: { tenant: tenant.host, phase_id: phase.id }
            )
          end
        end
      report.add_processed_tenant(tenant)
    end
    report.report!('generate_complete_analyses', verbose: true)
  end
end

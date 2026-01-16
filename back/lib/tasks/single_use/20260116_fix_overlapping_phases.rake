# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix overlapping phases on demo tenants caused by timestamp shifting bug (TAN-6109)'
  task fix_overlapping_phases: [:environment] do
    reporter = ScriptReporter.new

    Tenant.all.each do |tenant|
      next unless tenant.configuration.lifecycle_stage == 'demo'

      tenant.switch do
        Project.all.each do |project|
          phases = project.phases.order(:start_at).to_a
          next if phases.size < 2

          phases.each_cons(2) do |phase1, phase2|
            # Check if phases overlap by having the same date
            next unless phase1.end_at.present? && phase2.start_at.present?
            next unless phase1.end_at >= phase2.start_at

            # Fix by decreasing the first phase's end_at by 1 day
            old_end_at = phase1.end_at
            new_end_at = phase2.start_at - 1.day

            phase1.end_at = new_end_at

            if phase1.save
              reporter.add_change(
                phase1.id,
                "Fixed overlapping phase end_at: #{old_end_at} -> #{new_end_at}",
                context: {
                  tenant: tenant.host,
                  project_id: project.id,
                  phase1_id: phase1.id,
                  phase2_id: phase2.id,
                  phase2_start_at: phase2.start_at
                }
              )
            else
              reporter.add_error(
                "Failed to fix overlap: #{phase1.errors.full_messages.join(', ')}",
                context: {
                  tenant: tenant.host,
                  project_id: project.id,
                  phase1_id: phase1.id,
                  phase1_start_at: phase1.start_at,
                  old_end_at: old_end_at,
                  new_end_at: new_end_at,
                  phase2_id: phase2.id,
                  phase2_start_at: phase2.start_at
                }
              )
              phase1.reload
            end
          end
        end
      end
    end

    reporter.report!('fix_overlapping_phases_report.json', verbose: true)
  end
end

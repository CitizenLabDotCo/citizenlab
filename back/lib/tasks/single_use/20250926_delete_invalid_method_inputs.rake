namespace :inconsistant_data do
  desc 'Delete invalid inputs in ideation phases.'
  task :delete_proposals_in_ideation, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      Idea.where(creation_phase: Phase.where(participation_method: 'ideation')).find_each do |input|
        next if input.valid?

        if input.destroy
          reporter.add_delete(
            'Idea',
            input.id,
            context: { tenant: tenant.host }
          )
        else
          reporter.add_error(
            input.errors.details,
            context: { tenant: tenant.host, idea: input.id }
          )
        end
      end
    end
    reporter.report!('delete_invalid_method_inputs_report.json', verbose: true)
  end
end

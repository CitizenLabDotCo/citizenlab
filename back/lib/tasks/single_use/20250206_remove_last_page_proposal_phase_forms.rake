require 'json'

namespace :single_use do
  desc 'Sets code: null for education custom fields'
  task remove_proposal_phase_last_survey_pages: :environment do
    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      proposals_phases = Phase.where(participation_method: 'proposals')

      proposals_custom_forms = CustomForm.where(participation_context: proposals_phases)
      proposals_custom_forms.each do |custom_form|
        fields = custom_form.custom_fields
        fields.each do |field|
          if field.form_end_page?
            puts "Removing last page from form #{custom_form.id}"

            if field.destroy
              reporter.add_change(
                field.attributes,
                'destroyed',
                context: { tenant: tenant.host }
              )
            else
              reporter.add_error(
                field.errors.details,
                context: { tenant: tenant.host }
              )
            end
          end
        end
      end
    end

    reporter.report!('remove_proposal_phase_last_survey_pages.json', verbose: true)
  end
end

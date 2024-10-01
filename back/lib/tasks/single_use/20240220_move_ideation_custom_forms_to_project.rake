# frozen_string_literal: true

namespace :single_use do
  # Some custom forms used for ideation have a phase as participation context, instead of a
  # project. The ideation custom forms should always be associated with a project unlike
  # custom forms that implement native surveys.
  task move_ideation_custom_forms_to_project: :environment do
    Tenant.safe_switch_each do |tenant|
      custom_forms = CustomForm.where(participation_context_type: 'Phase')
      ActiveRecord::Associations::Preloader.new(
        records: custom_forms,
        associations: :participation_context
      ).call

      custom_forms.each do |form|
        next if form.participation_context.participation_method == 'native_survey'

        project = form.participation_context.project
        raise <<~MSG if project.custom_form.present?
          "Project '#{project.id}' already has a custom form (tenant: #{tenant.id}).
        MSG

        form.update!(participation_context: project)
      end
    end
  end
end

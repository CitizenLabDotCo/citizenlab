# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CustomForms < Base
      def run
        # This should add at least one custom form to existing projects
        create_form('ideation')
        create_form('budgeting')
      end

      private

      def create_form(participation_method)
        project = Phase.where(participation_method: participation_method).all.sample&.project

        return if !project || project.custom_form

        custom_form = CustomForm.create!(participation_context: project)
        participation_context = project.pmethod
        default_fields = participation_context.default_fields(custom_form)
        default_fields.each(&:save!)

        CustomField.create!(
          resource: custom_form,
          title_multiloc: { 'en' => 'Your favourite name for a swimming pool' },
          description_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
          input_type: 'text',
          required: false
        )

        CustomField.create!(
          resource: custom_form,
          input_type: 'point',
          title_multiloc: { 'en' => 'Where do want a new bike park?' },
          description_multiloc: { 'en' => 'Click on the map to indicate your preferred location' },
          required: false
        )
      end
    end
  end
end

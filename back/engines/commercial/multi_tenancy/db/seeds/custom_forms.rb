# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CustomForms < Base
      def run
        # This will add at least one custom form to existing projects
        %w[continuous timeline].each do |process_type|
          create_form(process_type, 'ideation')
          create_form(process_type, 'budgeting')
        end
      end

      private

      def create_form(process_type, participation_method)
        project = case process_type
        when 'timeline'
          Phase.where(participation_method: participation_method).all.sample&.project
        when 'continuous'
          Project.where(participation_method: participation_method).all.sample
        end

        return if !project || project.custom_form

        custom_form = CustomForm.create!(participation_context: project)
        participation_context = Factory.instance.participation_method_for(project)
        default_fields = participation_context.default_fields(custom_form)
        default_fields.each(&:save!)

        CustomField.create!(
          resource: custom_form,
          title_multiloc: { 'en' => 'Your favourite name for a swimming pool' },
          description_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
          input_type: 'text',
          required: false,
          answer_visible_to: 'admins'
        )
      end
    end
  end
end

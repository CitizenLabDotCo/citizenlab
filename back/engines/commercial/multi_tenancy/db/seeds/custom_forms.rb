# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CustomForms < Base
      def run
        3.times do |_i|
          process_type = %w[continuous timeline timeline].sample
          project = case process_type
          when 'timeline'
            Phase.where(participation_method: %w[ideation budgeting]).all.sample&.project
          when 'continuous'
            Project.where(participation_method: %w[ideation budgeting]).all.sample
          end

          next unless project

          custom_form = project.custom_form || CustomForm.create!(participation_context: project)
          built_in_custom_field = IdeaCustomFieldsService.new(custom_form).find_or_build_field %w[title_multiloc body_multiloc location_description].sample
          built_in_custom_field.description_multiloc = runner.create_for_some_locales { Faker::Lorem.sentence }
          built_in_custom_field.save!
          next unless rand(3) == 0

          CustomField.create!(
            resource: custom_form,
            title_multiloc: { 'en' => 'Your favourite name for a swimming pool' },
            description_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
            input_type: 'text',
            required: false
          )
        end
      end
    end
  end
end

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

          custom_form = project.custom_form || CustomForm.create!(project: project)
          custom_field = IdeaCustomFieldsService.new.find_or_build_field(custom_form,
            %w[title_multiloc body_multiloc location_description].sample)
          custom_field.description_multiloc = runner.create_for_some_locales { Faker::Lorem.sentence }
          custom_field.save!
        end
      end
    end
  end
end

# frozen_string_literal: true

module IdeaCustomFields
  module Extensions
    module Idea
      def self.included(base)
        base.class_eval do
          validates :custom_field_values, json: {
            schema: -> { extra_idea_fields_schema },
            message: ->(errors) { errors }
          }, on: :publication, if: :validate_extra_fields_on_publication?

          validates :custom_field_values, json: {
            schema: -> { extra_idea_fields_schema },
            message: ->(errors) { errors }
          }, if: :validate_extra_fields_on_update?
        end
      end

      private

      def validate_extra_fields_on_publication?
        dynamic_form_activated? && project.custom_form
      end

      def validate_extra_fields_on_update?
        custom_field_values_changed? && persisted? && dynamic_form_activated? && project.custom_form
      end

      def dynamic_form_activated?
        AppConfiguration.instance.feature_activated?('idea_custom_fields') &&
          AppConfiguration.instance.feature_activated?('dynamic_idea_form')
      end

      def extra_idea_fields_schema
        extra_fields = IdeaCustomFieldsService.new(project.custom_form).extra_visible_fields
        CustomFieldService.new.fields_to_json_schema extra_fields
      end
    end
  end
end

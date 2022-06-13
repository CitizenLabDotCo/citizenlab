# frozen_string_literal: true

module IdeaCustomFields
  module Extensions
    module Idea
      def self.included(base)
        base.class_eval do
          validates :custom_field_values, json: {
            schema: -> { idea_fields_schema },
            message: ->(errors) { errors }
          }, on: :publication, if: :dynamic_form_activated?

          validates :custom_field_values, json: {
            schema: -> { idea_fields_schema },
            message: ->(errors) { errors }
          }, if: %i[custom_field_values_changed? persisted? dynamic_form_activated?]
        end
      end

      def dynamic_form_activated?
        AppConfiguration.instance.feature_activated? 'dynamic_idea_form'
      end

      def idea_fields_schema
        return {} unless project.custom_form # The empty object schema accepts anything

        extra_fields = IdeaCustomFieldsService.new(project.custom_form).extra_visible_fields
        CustomFieldService.new.fields_to_json_schema extra_fields
      end
    end
  end
end

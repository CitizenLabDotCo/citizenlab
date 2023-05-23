# frozen_string_literal: true

module IdeaCustomFields
  module Extensions
    module Idea
      def self.included(base)
        # TODO: Validation of idea fields cannot be implemented correctly today.
        # In principle, all fields should be validated against the JSON
        # Schema, but that clashes with the hardcoded ActiveRecord validations
        # in idea and Post. When built-in fields (except title_multiloc and body_multiloc)
        # are configured as "required", then there are no validations to check missing
        # field values. On top of that, the validation errors coming out
        # of the back-end are not understood by the front-end.
        # See the document "The validation problem of idea custom fields" for
        # an analysis of the problem.
        # For now, we decide not to perform back-end validation of custom_field_values
        # and rely on the presence of front-end validation based on the JSON Schema.
        # We keep the original (but incomplete and incorrect) code here for reference.
        #
        # base.class_eval do
        #   validates :custom_field_values, json: {
        #     schema: -> { extra_idea_fields_schema },
        #   }, on: :publication, if: :validate_extra_fields_on_publication?

        #   validates :custom_field_values, json: {
        #     schema: -> { extra_idea_fields_schema },
        #   }, if: :validate_extra_fields_on_update?
        # end
      end

      private

      def validate_extra_fields_on_publication?
        project.custom_form
      end

      def validate_extra_fields_on_update?
        custom_field_values_changed? && persisted? && project.custom_form
      end

      def extra_idea_fields_schema
        extra_fields = IdeaCustomFieldsService.new(project.custom_form).extra_visible_fields
        CustomFieldService.new.fields_to_json_schema extra_fields
      end
    end
  end
end

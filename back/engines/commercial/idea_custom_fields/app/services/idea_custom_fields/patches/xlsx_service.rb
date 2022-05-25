# frozen_string_literal: true

module IdeaCustomFields
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
        if AppConfiguration.instance.feature_activated? 'idea_custom_fields'
          super + custom_form_custom_field_columns(:itself, ideas)
        else
          super
        end
      end

      private

      def custom_form_custom_field_columns(record_to_idea, ideas)
        projects = ideas.map(&:project)
        idea_custom_fields = CustomField.where(resource: CustomForm.where(project: projects))

        # options keys are only unique in the scope of their field, namespacing to avoid collisions
        options = CustomFieldOption.where(custom_field: idea_custom_fields).index_by { |option| namespace(option.custom_field_id, option.key) }

        idea_custom_fields.map do |field|
          column_name = multiloc_service.t(field.title_multiloc)
          { header: column_name, f: value_getter_for_custom_form_custom_field_columns(field, record_to_idea, options) }
        end
      end

      def value_getter_for_custom_form_custom_field_columns(field, record_to_idea, options)
        if field.support_options? # field with option
          lambda do |record|
            idea = record.send(record_to_idea)
            title_multiloc_for idea, field, options
          end
        else # all other custom fields
          lambda do |record|
            idea = record.send(record_to_idea)
            idea && idea.custom_field_values[field.key]
          end
        end
      end
    end
  end
end

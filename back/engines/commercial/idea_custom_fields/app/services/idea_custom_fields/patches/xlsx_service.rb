# frozen_string_literal: true

module IdeaCustomFields
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
        if AppConfiguration.instance.feature_activated? 'idea_custom_fields'
          super + custom_form_custom_field_columns(ideas)
        else
          super
        end
      end

      private

      def custom_form_custom_field_columns(ideas)
        idea_custom_fields = ideas.map(&:project).flat_map do |project|
          ::IdeaCustomFieldsService.new(project.custom_form).reportable_fields
        end

        # options keys are only unique in the scope of their field, namespacing to avoid collisions
        options = CustomFieldOption.where(custom_field: idea_custom_fields).index_by { |option| namespace(option.custom_field_id, option.key) }

        idea_custom_fields.map do |field|
          column_name = multiloc_service.t(field.title_multiloc)
          { header: column_name, f: value_getter_for_custom_form_custom_field_columns(field, options) }
        end
      end

      def value_getter_for_custom_form_custom_field_columns(field, options)
        if field.support_options?
          lambda do |idea|
            title_multiloc_for idea, field, options
          end
        else
          lambda do |idea|
            idea && idea.custom_field_values[field.key]
          end
        end
      end
    end
  end
end

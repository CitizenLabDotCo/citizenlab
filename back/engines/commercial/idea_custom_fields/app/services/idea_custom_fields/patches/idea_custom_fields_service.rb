# frozen_string_literal: true

module IdeaCustomFields
  module Patches
    module IdeaCustomFieldsService
      def all_fields(custom_form)
        custom_and_default_fields custom_form
      end

      def find_or_build_field(custom_form, code)
        custom_form&.custom_fields&.find_by(code: code) ||
          default_fields(custom_form).find { |bicf| bicf.code == code }
      end

      private

      def custom_and_default_fields(custom_form)
        persisted_fields = custom_form.custom_fields
        default_fields = default_fields custom_form
        [
          *default_fields.map do |default_field|
            persisted_fields.find { |c| default_field.code == c.code } || default_field
          end,
          *persisted_fields.reject(&:built_in?)
        ]
      end
    end
  end
end

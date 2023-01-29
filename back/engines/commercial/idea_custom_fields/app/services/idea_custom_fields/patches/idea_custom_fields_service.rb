# frozen_string_literal: true

module IdeaCustomFields
  module Patches
    module IdeaCustomFieldsService
      def all_fields
        custom_and_default_fields
      end

      def find_or_build_field(code)
        return unless custom_form

        custom_form.custom_fields.find_by(code: code) ||
          default_fields.find { |default_field| default_field.code == code }
      end

      def find_field_by_id(id)
        return unless custom_form

        custom_form.custom_fields.find_by(id: id)
      end

      private

      def custom_and_default_fields
        persisted_fields = if custom_form
          custom_form.custom_fields.includes(:options)
        else
          []
        end
        [
          *default_fields.map do |default_field|
            persisted_fields.find { |c| default_field.code == c.code } || default_field
          end,
          *persisted_fields.reject(&:built_in?).sort_by(&:ordering)
        ]
      end
    end
  end
end

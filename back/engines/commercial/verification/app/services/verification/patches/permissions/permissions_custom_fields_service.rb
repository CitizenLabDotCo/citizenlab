# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module PermissionsCustomFieldsService
        # return_hidden must be true for verification fields to be added - this is because we don't want to show them in the UI
        def fields_for_permission(permission, return_hidden: false)
          fields = super

          add_verification_fields(permission, fields) if return_hidden && permission.verification_enabled?
          fields
        end

        private

        # Add any fields that are locked to verification method
        def add_verification_fields(permission, fields)
          method = VerificationService.new.first_method_enabled
          return fields unless method.respond_to?(:locked_custom_fields) && method.locked_custom_fields.present?

          # Get the IDs of the custom fields that are locked to the verification method
          custom_field_required_array = CustomField.where(code: method.locked_custom_fields).map do |field|
            { id: field.id, required: true }
          end

          add_and_lock_related_fields(permission, fields, custom_field_required_array, 'verification')
        end
      end
    end
  end
end

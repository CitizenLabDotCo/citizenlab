# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module PermissionsFieldsService
        # return_hidden must be true for verification fields to be added - this is because we don't want to show them in the UI
        def fields_for_permission(permission, return_hidden: false)
          fields = super

          add_verification_fields(permission, fields) if return_hidden && permission.verification_enabled?
          fields
        end

        private

        # Add any fields that are locked to verification method
        def add_verification_fields(permission, fields)
          method = verification_methods.first
          return fields unless method.respond_to?(:locked_custom_fields)

          # Get the IDs of the custom fields that are locked to the verification method
          custom_field_ids = method&.locked_custom_fields&.map { |field_code| CustomField.find_by(code: field_code.to_s)&.id }&.compact
          add_and_lock_related_fields(permission, fields, custom_field_ids, 'verification')
        end

        def verification_methods
          @verification_methods ||= VerificationService.new.active_methods(AppConfiguration.instance)
        end
      end
    end
  end
end

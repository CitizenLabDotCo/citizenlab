# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module PermissionsFieldsService
        def default_fields(permitted_by: 'users', permission: nil)
          fields = super

          if VerificationService.new.active_methods(AppConfiguration.instance).any?
            verification_field = PermissionsField.new(field_type: 'verification', id: SecureRandom.uuid, required: false, enabled: false, permission: permission)
            fields = fields.insert(2, verification_field)
            fields.map.with_index do |field, index|
              field.ordering = index # Reset ordering of all fields
              field
            end
          end

          fields
        end
      end
    end
  end
end

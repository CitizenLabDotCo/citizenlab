# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module PermissionsFieldsService
        def default_fields(permitted_by: 'users', permission: nil)
          fields = super

          if verification_methods.any?
            verification_field = PermissionsField.new(field_type: 'verification', id: SecureRandom.uuid, required: false, enabled: false, permission: permission)
            fields = fields.insert(2, verification_field)
            fields.map.with_index do |field, index|
              field.ordering = index # Reset ordering of all fields
              field
            end
          end

          fields
        end

        def enforce_restrictions(field)
          super

          if field.field_type == 'verification'
            if field.enabled
              method = verification_methods.first

              # Ensure that locked_custom_fields from the verification method are always present
              ordering = 3 # Any locked fields to get inserted/moved above any other custom fields
              method&.locked_custom_fields&.each do |field_code|
                custom_field = CustomField.find_by(code: field_code.to_s)
                next if custom_field.nil?

                existing_permission_field = field.permission.permissions_fields.find_by(custom_field: custom_field)
                if existing_permission_field.nil?
                  # Insert a new one if it's not already there
                  PermissionsField.create!(field_type: 'custom_field', custom_field: custom_field, required: true, enabled: true, ordering: ordering, permission: field.permission)
                else
                  # Update the existing one
                  existing_permission_field.update!(ordering: ordering, required: true)
                end
                ordering += 1
              end
            end
          end

        end

        private

        def verification_methods
          @verification_methods ||= VerificationService.new.active_methods(AppConfiguration.instance)
        end

      end
    end
  end
end

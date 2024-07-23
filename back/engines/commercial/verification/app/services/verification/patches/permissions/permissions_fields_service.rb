# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module PermissionsFieldsService
        def default_fields(permission)
          fields = super

          add_verification_fields(permission, fields) if permission.verification_enabled?
          fields
        end

        # Add any fields that are locked to verification method
        # TODO: JS - Add this when we add groups or change permission too
        def add_verification_fields(permission, fields)
          ordering = 0 # Any locked fields to get inserted/moved above any other custom fields
          method = verification_methods.first
          method&.locked_custom_fields&.each do |field_code|
            custom_field = CustomField.find_by(code: field_code.to_s)
            next if custom_field.nil?

            existing_permission_field = fields.find { |field| field[:custom_field_id] == custom_field.id }
            if existing_permission_field.nil?
              # Insert a new one if it's not already there
              new_field = PermissionsField.new(custom_field: custom_field, required: true, ordering: ordering, permission: permission)
              fields.insert(ordering, new_field)
            else
              # Set the existing one to true and move to the top
              existing_permission_field.ordering = ordering
              existing_permission_field.required = true
              fields.insert(ordering, fields.delete(existing_permission_field))
            end
            ordering += 1
          end
          fields.each_with_index { |field, index| field.ordering = index }
        end

        def persist_related_verification_fields(permission)
          return if permission.global_custom_fields

          # TODO: JS - persist group fields
        end

        private

        def verification_methods
          @verification_methods ||= VerificationService.new.active_methods(AppConfiguration.instance)
        end
      end
    end
  end
end

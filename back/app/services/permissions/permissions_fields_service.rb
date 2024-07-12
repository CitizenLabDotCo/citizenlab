# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def fields_for_permission(permission)
      return permission.permissions_fields if permission.permitted_by == 'custom'

      default_fields(permitted_by: permission.permitted_by, permission: permission)
    end

    # To be called from rake task when enabling custom_permitted_by feature flag or on tenant creation
    def change_permissions_to_custom
      if custom_permitted_by_enabled?
        permissions = Permission.where.not(permission_scope: nil)
        permissions.each do |permission|
          if !permission.global_custom_fields
            if permission.permitted_by == 'everyone_confirmed_email'
              if PermissionsField.find_by(permission: permission).present? # Used because the method is overridden in the model
                # Set to 'custom' & insert 'everyone_confirmed_email' default fields
                permission.update!(permitted_by: 'custom')
                fields = default_fields(permitted_by: 'everyone_confirmed_email', permission: permission)
              end
            elsif permission.permitted_by == 'users' || permission.permitted_by == 'groups'
              # Set to 'custom' & insert 'users' default fields without custom fields
              permission.update!(permitted_by: 'custom')
              fields = default_fields(permitted_by: 'users', permission: permission).reject { |f| f[:field_type] == 'custom_field' }
            end
          elsif permission.permitted_by == 'groups'
            # Set to 'custom' & insert 'users' default fields
            permission.update!(permitted_by: 'custom')
            fields = default_fields(permitted_by: 'users', permission: permission)
          end

          # Save the default fields
          if fields.present?
            fields.each(&:save!)
          end
        end
      end
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def create_default_fields_for_custom_permitted_by(permission: nil, previous_permitted_by: 'users')
      return unless permission&.permitted_by == 'custom' && permission&.permissions_fields&.empty?

      fields = default_fields(permitted_by: previous_permitted_by, permission: permission)
      fields.each(&:save!)
    end

    def custom_permitted_by_enabled?
      @custom_permitted_by_enabled ||= AppConfiguration.instance.feature_activated?('custom_permitted_by')
    end

    private

    def default_fields(permitted_by: 'users', permission: nil)
      # Built in fields
      name_field = PermissionsField.new(field_type: 'name', required: true, enabled: true, permission: permission)
      email_field = PermissionsField.new(field_type: 'email', required: true, enabled: true, locked: true, permission: permission, config: { password: true, confirmed: true })

      # Global custom fields
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_permissions_fields = custom_fields.map do |field|
        PermissionsField.new(field_type: 'custom_field', custom_field: field, required: field.required, enabled: true, permission: permission)
      end

      default_fields = [name_field, email_field] + custom_permissions_fields

      fields = case permitted_by
      when 'everyone'
        # Remove custom fields and disable all fields
        fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
        fields.map do |field|
          field.required = false
          field.enabled = false
          field
        end
      when 'everyone_confirmed_email'
        # Turn off custom_fields, name & password
        fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
        fields.find { |f| f.field_type == 'name' }.enabled = false
        fields.find { |f| f.field_type == 'name' }.required = false
        fields.find { |f| f.field_type == 'email' }.config['password'] = false
        fields
      else
        default_fields
      end

      # Return with ordering
      fields.map.with_index do |field, index|
        field.ordering = index
        field
      end
    end
  end
end

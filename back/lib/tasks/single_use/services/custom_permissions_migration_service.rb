# frozen_string_literal: true

class Tasks::SingleUse::Services::CustomPermissionsMigrationService
  # To be called from rake task when enabling custom_permitted_by feature flag
  def change_permissions_to_custom
    if permissions_fields_service.custom_permitted_by_enabled?
      permissions = Permission.where.not(permission_scope: nil)
      permissions.each do |permission|
        if !permission.global_custom_fields
          if permission.permitted_by == 'everyone_confirmed_email'
            if PermissionsField.find_by(permission: permission).present? # Used because the method is overridden in the model
              # Set to 'custom' & insert 'everyone_confirmed_email' default fields
              permission.update!(permitted_by: 'custom')
              fields = permissions_fields_service.default_fields(permitted_by: 'everyone_confirmed_email', permission: permission)
            end
          elsif permission.permitted_by == 'users' || permission.permitted_by == 'groups'
            # Set to 'custom' & insert 'users' default fields without custom fields
            permission.update!(permitted_by: 'custom')
            fields = permissions_fields_service.default_fields(permitted_by: 'users', permission: permission).reject { |f| f[:field_type] == 'custom_field' }
          end
        elsif permission.permitted_by == 'groups'
          # Set to 'custom' & insert 'users' default fields
          permission.update!(permitted_by: 'custom')
          fields = permissions_fields_service.default_fields(permitted_by: 'users', permission: permission)
        end

        # Save the default fields
        if fields.present?
          fields.each(&:save!)
        end
      end
    end
  end

  def revert_custom_permissions
    # TODO: JS - Roll back the above changes
  end

  def permissions_fields_service
    @permissions_fields_service ||= Permissions::PermissionsFieldsService.new
  end
end

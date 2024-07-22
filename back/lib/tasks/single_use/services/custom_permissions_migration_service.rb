# frozen_string_literal: true

class Tasks::SingleUse::Services::CustomPermissionsMigrationService
  # To be called from rake task when enabling custom_permitted_by feature flag
  def change_permissions_to_custom
    if permissions_fields_service.custom_permitted_by_enabled?
      permissions = Permission.where.not(permission_scope: nil)
      permissions.each do |permission|
        # Set group permissions to 'users' as groups allowed on all permitted_by now
        if permission.permitted_by == 'groups'
          permission.update!(permitted_by: 'users')
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

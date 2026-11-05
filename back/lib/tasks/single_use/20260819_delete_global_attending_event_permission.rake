# frozen_string_literal: true

# The global 'attending_event' permission used to be created eagerly, like every other permission
# of the global scope. It is now inheritable: without a row of its own the action follows the
# global 'visiting' permission, which drives the platform-wide sign up / log in flow. See
# Permissions::PermissionInheritanceService.
#
# This deletes the rows left behind by the eager creation, so event attendance starts following
# 'visiting' everywhere. Unlike the phase permissions, they are deleted whatever they hold: the
# global 'attending_event' permission has no screen of its own, so nothing in it was ever set by
# an admin. Its groups and demographic questions go with it.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:delete_global_attending_event_permission                     # dry run, all tenants
#     rake 'single_use:delete_global_attending_event_permission[execute]'          # delete, all tenants
#     rake 'single_use:delete_global_attending_event_permission[execute,foo.com]'  # delete, one tenant
namespace :single_use do
  desc "Delete the global 'attending_event' permission, so the action inherits. Dry run unless passed 'execute'."
  task :delete_global_attending_event_permission, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'delete_global_attending_event_permission',
      args: args,
      description: "deleting the global 'attending_event' permission, so the action follows the 'visiting' one"
    ) do |tenant, script|
      Permission.where(permission_scope: nil, action: 'attending_event').each do |permission|
        script.reporter.add_delete(
          'Permission',
          permission.id,
          context: { tenant: tenant.host, action: permission.action }
        )
        permission.destroy! if script.execute?
      end
    end
  end
end

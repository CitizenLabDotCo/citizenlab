# frozen_string_literal: true

# Phase permissions used to be created eagerly for every action a participation method supports.
# They are now only created when an admin *overrides* the action; until then it follows the global
# 'visiting' permission, which drives the platform-wide sign up / log in flow. See
# Permissions::PermissionInheritanceService.
#
# This deletes the phase permissions that are already an exact copy of their tenant's 'visiting'
# permission, so those actions go back to inheriting and start following it again. A permission
# that differs in any way — an attribute, a group, a demographic question — is a customisation an
# admin made and is left alone, so nothing an admin can see changes.
#
# The comparison lives here rather than on the service because it is only ever needed once: it
# reads every inheritable attribute (whatever they are at the time this runs), the group ids and
# the persisted demographic questions, and all three have to match for the row to be redundant.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:delete_inherited_phase_permissions                     # dry run, all tenants
#     rake 'single_use:delete_inherited_phase_permissions[execute]'          # delete, all tenants
#     rake 'single_use:delete_inherited_phase_permissions[execute,foo.com]'  # delete, one tenant
namespace :single_use do
  desc "Delete the phase permissions identical to the global 'visiting' one. Dry run unless passed 'execute'."
  task :delete_inherited_phase_permissions, %i[execute host] => [:environment] do |_t, args|
    custom_fields_fingerprint = lambda do |permission|
      permission.permissions_custom_fields.map { |field| [field.custom_field_id, field.required, field.ordering] }.sort
    end

    TenantScript.run(
      'delete_inherited_phase_permissions',
      args: args,
      description: "deleting the phase permissions identical to the global 'visiting' permission"
    ) do |tenant, script|
      service = Permissions::PermissionInheritanceService.new
      # Current is reset per Apartment switch, but not by safe_switch_each's own bookkeeping.
      Permissions::PermissionInheritanceService.clear_source_permission_cache
      source = Permissions::PermissionInheritanceService.source_permission

      # A tenant without a 'visiting' permission has nothing to inherit from, so nothing here is
      # redundant. Skipped rather than treated as "matches nothing", which would read as a clean pass.
      next script.reporter.add_error("no 'visiting' permission", context: { tenant: tenant.host }) unless source

      source_attributes = service.inheritable_attributes(source)
      source_group_ids = source.groups.ids.sort
      source_fields = custom_fields_fingerprint.call(source)

      permissions = Permission.where(permission_scope_type: 'Phase')
        .includes(:groups, :permission_scope, permissions_custom_fields: [:custom_field])

      permissions.each do |permission|
        next unless service.inheritable_attributes(permission) == source_attributes
        next unless permission.groups.ids.sort == source_group_ids
        next unless custom_fields_fingerprint.call(permission) == source_fields

        script.reporter.add_delete(
          'Permission',
          permission.id,
          context: {
            tenant: tenant.host,
            action: permission.action,
            phase_id: permission.permission_scope_id,
            project_id: permission.permission_scope&.project_id
          }
        )
        permission.destroy! if script.execute?
      end
    end
  end
end

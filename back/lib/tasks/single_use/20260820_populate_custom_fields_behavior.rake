# frozen_string_literal: true

# Permissions used to express how demographic questions are picked through two attributes:
# `global_custom_fields` (ask the platform's enabled user fields) and, when that was false,
# the persisted `permissions_custom_fields` (ask those, or nothing when there were none).
# `custom_fields_behavior` replaces both with one of 'global', 'disabled' and 'custom'.
#
# This fills the new column in for the existing rows. Permissions::CustomFieldsBehaviorService
# owns the mapping, which is chosen so that every permission keeps asking exactly the questions
# it asks today. `global_custom_fields` is deliberately left untouched, so the column this
# writes can be dropped again without any data being lost.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:populate_custom_fields_behavior                     # dry run, all tenants
#     rake 'single_use:populate_custom_fields_behavior[execute]'          # populate, all tenants
#     rake 'single_use:populate_custom_fields_behavior[execute,foo.com]'  # populate, one tenant
namespace :single_use do
  desc "Populate permissions.custom_fields_behavior. Dry run unless passed 'execute'."
  task :populate_custom_fields_behavior, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'populate_custom_fields_behavior',
      args: args,
      description: 'populating permissions.custom_fields_behavior from global_custom_fields and the persisted fields',
      # Every permission has to end up with a value, including on the tenants
      # whose creation never finalized: a follow-up makes the column NOT NULL.
      tenants: Tenant.all
    ) do |tenant, script|
      service = Permissions::CustomFieldsBehaviorService.new

      Permission.where(custom_fields_behavior: nil).includes(:permissions_custom_fields).find_each do |permission|
        behavior = service.derive(permission)

        script.reporter.add_change(
          nil,
          behavior,
          context: { tenant: tenant.host, permission_id: permission.id, action: permission.action }
        )
        permission.update_column(:custom_fields_behavior, behavior) if script.execute?
      end
    end
  end
end

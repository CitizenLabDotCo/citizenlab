# frozen_string_literal: true

# Turns on the `exclude_admins_and_moderators_from_statistics` core setting for every tenant
# (TAN-8828), so the participation and visits of admins and moderators are left out of
# statistics and graphs everywhere. Tenants that already have it enabled are left alone.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:enable_exclude_admins_and_moderators_from_statistics                     # dry run, all tenants
#     rake 'single_use:enable_exclude_admins_and_moderators_from_statistics[execute]'          # enable, all tenants
#     rake 'single_use:enable_exclude_admins_and_moderators_from_statistics[execute,foo.com]'  # enable, one tenant
namespace :single_use do
  desc "Enable the 'exclude_admins_and_moderators_from_statistics' core setting. Dry run unless passed 'execute'."
  task :enable_exclude_admins_and_moderators_from_statistics, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'enable_exclude_admins_and_moderators_from_statistics',
      args: args,
      description: "enabling the 'exclude_admins_and_moderators_from_statistics' core setting"
    ) do |tenant, script|
      config = AppConfiguration.instance
      old_value = config.settings.dig('core', 'exclude_admins_and_moderators_from_statistics')
      next if old_value == true

      script.reporter.add_change(old_value, true, context: { tenant: tenant.host })
      next unless script.execute?

      config.settings['core']['exclude_admins_and_moderators_from_statistics'] = true
      config.save!
    end
  end
end

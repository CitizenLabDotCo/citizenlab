# frozen_string_literal: true

# Enables every disabled page.
#
# Logic can jump to any page, but forms leave disabled pages out, so a jump to one gives the
# respondent a blank form and the results count every later question as unseen. Pages must
# therefore always be enabled, which a validation on custom fields enforces. That validation
# makes any save of a disabled page fail, so run this task before or with its release.
#
# The form builder never disables a page, so very few or none are expected: they can only come
# from the API, the MCP tools, the builder's JSON editor or data written outside the app. Run the
# dry run first to see which pages would change. Enabling a page moves its enabled questions from
# the previous page onto their own page again.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:enable_disabled_pages                     # dry run, all tenants
#     rake 'single_use:enable_disabled_pages[execute]'          # enable, all tenants
#     rake 'single_use:enable_disabled_pages[execute,foo.com]'  # enable, one tenant
namespace :single_use do
  desc "Enable every disabled page. Dry run unless passed 'execute'."
  task :enable_disabled_pages, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run('enable_disabled_pages', args: args, description: 'enabling disabled pages') do |tenant, script|
      CustomField.where(input_type: 'page', enabled: false).find_each do |page|
        script.reporter.add_change(
          false, true,
          context: {
            tenant: tenant.host,
            custom_field_id: page.id,
            resource_type: page.resource_type,
            resource_id: page.resource_id
          }
        )
        page.update_column(:enabled, true) if script.execute?
      end
    end
  end
end

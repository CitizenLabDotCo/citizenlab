# frozen_string_literal: true

# Asking demographic questions of an action's own choosing ('custom') is part of the
# `permissions_custom_fields` feature. Permissions predating that rule can sit on 'custom'
# on a platform that does not have the feature; this puts them back on the platform-wide
# questions.
#
# That CHANGES WHAT PARTICIPANTS ARE ASKED on the affected actions: the questions curated
# on the permission give way to the platform's. Run the dry run first and reach out to the
# platforms it lists — it reports every affected action, with the project and phase it
# belongs to, both in the summary and in the JSON report.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:reset_custom_fields_behavior_without_feature                     # dry run, all tenants
#     rake 'single_use:reset_custom_fields_behavior_without_feature[execute]'          # write, all tenants
#     rake 'single_use:reset_custom_fields_behavior_without_feature[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Put permissions asking their own demographic questions without the feature back on the platform-wide ones. Dry run unless passed 'execute'."
  task :reset_custom_fields_behavior_without_feature, %i[execute host] => [:environment] do |_t, args|
    affected = Hash.new { |hash, host| hash[host] = 0 }

    # Where the affected action lives, so that a platform can be told which project it
    # is about rather than being handed a permission id.
    scope_context = lambda do |permission|
      phase = permission.permission_scope
      next { scope: 'platform-wide' } unless phase.is_a?(Phase)

      project = phase.project

      {
        project_slug: project.slug,
        project_title: project.title_multiloc.values.first,
        phase_title: phase.title_multiloc.values.first
      }
    end

    TenantScript.run(
      'reset_custom_fields_behavior_without_feature',
      args: args,
      description: "putting permissions on 'custom' without the permissions_custom_fields feature back on 'global'",
      summary: lambda { |_script|
        next puts "\n   No platform asks custom demographic questions without the feature." if affected.empty?

        puts "\n   Platforms to reach out to (#{affected.size}):"
        affected.sort_by { |host, _count| host }.each do |host, count|
          puts "     #{host}: #{count} action(s)"
        end
      }
    ) do |tenant, script|
      next if AppConfiguration.instance.feature_activated?('permissions_custom_fields')

      Permission.where(custom_fields_behavior: 'custom').includes(:permission_scope).find_each do |permission|
        affected[tenant.host] += 1

        script.reporter.add_change(
          'custom',
          'global',
          context: {
            tenant: tenant.host,
            permission_id: permission.id,
            action: permission.action
          }.merge(scope_context.call(permission))
        )
        permission.update_column(:custom_fields_behavior, 'global') if script.execute?
      end
    end
  end
end

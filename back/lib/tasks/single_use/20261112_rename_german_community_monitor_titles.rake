# frozen_string_literal: true

# Renames the stored German community monitor titles from "Gemeinschaftspuls" to
# "Stimmungsbarometer" (TAN-9073).
#
# The community monitor project and phase get their titles from the translations one time, when
# they are created. A later change of the translation does not change these stored titles. The
# German translation changed in May 2026, so platforms with an older community monitor still
# show the old name.
#
# The task changes only values that are exactly the old default. Custom titles stay as they are.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:rename_german_community_monitor_titles                     # dry run, all tenants
#     rake 'single_use:rename_german_community_monitor_titles[execute]'          # rename, all tenants
#     rake 'single_use:rename_german_community_monitor_titles[execute,foo.com]'  # rename, one tenant
namespace :single_use do
  desc "Rename stored German community monitor titles to 'Stimmungsbarometer'. Dry run unless passed 'execute'."
  task :rename_german_community_monitor_titles, %i[execute host] => [:environment] do |_t, args|
    old_title = 'Gemeinschaftspuls'
    new_title = 'Stimmungsbarometer'
    locales = %w[de-DE de-AT]

    TenantScript.run(
      'rename_german_community_monitor_titles',
      args: args,
      description: "renaming stored community monitor titles from '#{old_title}' to '#{new_title}'"
    ) do |tenant, script|
      projects = Project.where(internal_role: 'community_monitor')
      phases = Phase.where(project: projects, participation_method: 'community_monitor_survey')

      targets = projects.map { |project| [project, %i[title_multiloc]] } +
                phases.map { |phase| [phase, %i[title_multiloc native_survey_title_multiloc]] }

      targets.each do |record, attributes|
        attributes.each do |attribute|
          multiloc = record[attribute] || {}
          stale_locales = locales.select { |locale| multiloc[locale] == old_title }
          next if stale_locales.empty?

          new_multiloc = multiloc.merge(stale_locales.index_with { new_title })
          script.reporter.add_change(
            multiloc, new_multiloc,
            context: { tenant: tenant.host, record: record.class.name, id: record.id, attribute: attribute }
          )
          record.update_column(attribute, new_multiloc) if script.execute?
        end
      end
    end
  end
end

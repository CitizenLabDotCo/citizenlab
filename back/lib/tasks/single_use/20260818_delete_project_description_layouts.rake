# frozen_string_literal: true

# The `project_description` layouts were the projects' Content Builder home before the
# project page builder. The migration onto `project_page` was additive, so every migrated
# tenant still carries them even though nothing reads them any more. They are not inert:
# `Concerns::ContentBuildable::CRAFTJS_PROJECT_TEXT_QUERY` aggregates *every* enabled
# layout of a project, so their stale text keeps matching project search, and both the
# project copy and the tenant template carry them into new records.
namespace :single_use do
  desc "Delete the projects' superseded project_description layouts. Dry run unless passed 'execute'."
  task :delete_project_description_layouts, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'delete_project_description_layouts',
      args: args,
      description: 'deleting superseded project_description layouts'
    ) do |tenant, script|
      layouts = ContentBuilder::Layout.where(code: 'project_description', content_buildable_type: 'Project')

      layouts.find_each do |layout|
        context = { tenant: tenant.host, project_id: layout.content_buildable_id }
        script.reporter.add_delete('ContentBuilder::Layout', layout.id, context: context)
        # `destroy` (not `delete_all`) so the layout's file attachments go with it. The
        # TextImages stay: they hang off the project, and the migrated `project_page`
        # bridge widgets still reference them by `text_reference`.
        layout.destroy! if script.execute?
      end
    end
  end
end

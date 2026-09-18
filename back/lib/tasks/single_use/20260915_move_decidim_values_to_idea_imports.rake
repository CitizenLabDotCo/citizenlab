# frozen_string_literal: true

# The Decidim importer used to park Decidim data with no Go Vocal field (e.g. `decidim_scope`,
# `decidim_status`) in each imported idea's `custom_field_values`. It now keeps that data in the
# `extra_info` of the idea's `IdeaImport`. This moves the data for ideas imported before that change:
# every `decidim_*` key leaves `custom_field_values` and goes into `extra_info`, creating the idea
# import when the idea has none.
#
# Only one platform was imported this way, so the host is required.
#
# `TenantScript` owns the dry run and the report.
#
#     rake 'single_use:move_decidim_values_to_idea_imports[foo.com]'          # dry run
#     rake 'single_use:move_decidim_values_to_idea_imports[foo.com,execute]'  # write
namespace :single_use do
  desc "Move decidim_* values from idea custom_field_values to idea import extra_info. Dry run unless passed 'execute'."
  task :move_decidim_values_to_idea_imports, %i[host execute] => [:environment] do |_t, args|
    raise ArgumentError, 'a host is required' if args[:host].blank?

    TenantScript.run(
      'move_decidim_values_to_idea_imports',
      args: args,
      description: 'moving decidim_* values from idea custom_field_values to idea import extra_info'
    ) do |tenant, script|
      ideas = Idea.includes(:idea_import).where(<<~SQL.squish)
        EXISTS (SELECT 1 FROM jsonb_object_keys(ideas.custom_field_values) AS key WHERE key LIKE 'decidim\\_%')
      SQL

      ideas.find_each do |idea|
        decidim_values = idea.custom_field_values.select { |key, _| key.start_with?('decidim_') }
        remaining_values = idea.custom_field_values.except(*decidim_values.keys)
        idea_import = idea.idea_import
        extra_info = (idea_import&.extra_info || {}).merge(decidim_values)
        context = { tenant: tenant.host, idea_id: idea.id }

        script.reporter.add_change(idea.custom_field_values, remaining_values, context: context)
        if idea_import
          script.reporter.add_change(idea_import.extra_info, extra_info, context: context.merge(idea_import_id: idea_import.id))
        else
          script.reporter.add_create('BulkImportIdeas::IdeaImport', { idea_id: idea.id, extra_info: extra_info }, context: context)
        end
        next unless script.execute?

        ActiveRecord::Base.transaction do
          if idea_import
            idea_import.update!(extra_info: extra_info)
          else
            BulkImportIdeas::IdeaImport.create!(idea: idea, extra_info: extra_info)
          end
          # Update the values (triggers sync to answers table too)
          idea.update!(custom_field_values: remaining_values)
        end
      end
    end
  end
end

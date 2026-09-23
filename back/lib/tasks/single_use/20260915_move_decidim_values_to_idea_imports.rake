# frozen_string_literal: true

# The Decidim importer used to park Decidim data with no Go Vocal field (e.g. `decidim_scope`,
# `decidim_status`) in each imported idea's custom field answers. It now keeps that data in the
# `extra_info` of the idea's `IdeaImport`. This moves the data for ideas imported before that change:
# every `decidim_*` answer leaves the answers and goes into `extra_info`, creating the idea
# import when the idea has none.
#
# Only one platform was imported this way, so the host is required.
#
# `TenantScript` owns the dry run and the report.
#
#     rake 'single_use:move_decidim_values_to_idea_imports[foo.com]'          # dry run
#     rake 'single_use:move_decidim_values_to_idea_imports[foo.com,execute]'  # write
namespace :single_use do
  desc "Move decidim_* values from idea custom field answers to idea import extra_info. Dry run unless passed 'execute'."
  task :move_decidim_values_to_idea_imports, %i[host execute] => [:environment] do |_t, args|
    raise ArgumentError, 'a host is required' if args[:host].blank?

    TenantScript.run(
      'move_decidim_values_to_idea_imports',
      args: args,
      description: 'moving decidim_* values from idea custom field answers to idea import extra_info'
    ) do |tenant, script|
      decidim_answers = CustomFieldAnswer.where(answerable_type: 'Idea').where("key LIKE 'decidim\\_%'")
      ideas = Idea.includes(:idea_import, :custom_field_answers).where(id: decidim_answers.select(:answerable_id))

      ideas.find_each do |idea|
        answers = idea.custom_field_answers.select { it.key.start_with?('decidim_') }
        idea_import = idea.idea_import
        extra_info = (idea_import&.extra_info || {}).merge(answers.to_h { [it.key, it.value] })
        context = { tenant: tenant.host, idea_id: idea.id }

        answers.each { |answer| script.reporter.add_delete('CustomFieldAnswer', answer.id, context: context.merge(key: answer.key)) }
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
          CustomFieldAnswer.where(id: answers.map(&:id)).delete_all
        end
      end
    end
  end
end

# frozen_string_literal: true

namespace :single_use do
  desc 'Add FileAttachment widgets to project_page layouts for project-attached files'
  task move_project_files_to_page_builder: :environment do
    dry_run = ENV['DRY_RUN'] != 'false'
    reporter = ScriptReporter.new
    service = ContentBuilder::ProjectPageLayoutService.new

    Tenant.safe_switch_each do |tenant|
      project_ids = Files::FileAttachment
        .where(attachable_type: 'Project')
        .distinct
        .pluck(:attachable_id)
      next if project_ids.empty?

      reporter.add_processed_tenant(tenant)

      Project.where(id: project_ids).find_each do |project|
        context = { tenant: tenant.host, project_id: project.id }
        layout = ContentBuilder::Layout.find_by(
          content_buildable: project,
          code: ContentBuilder::ProjectPageLayoutService::CODE
        )

        if layout.nil?
          layout = ContentBuilder::Layout.new(
            content_buildable: project,
            code: ContentBuilder::ProjectPageLayoutService::CODE,
            enabled: true,
            craftjs_json: service.craftjs_json_for(project)
          )

          if dry_run
            reporter.add_create('ContentBuilder::Layout', layout.attributes, context: context)
          elsif layout.save
            reporter.add_create('ContentBuilder::Layout', { id: layout.id }.merge(layout.attributes), context: context)
          else
            reporter.add_error(layout.errors.details, context: context)
          end
        else
          old_json = layout.craftjs_json
          new_json = old_json.present? ? service.append_file_nodes(old_json, project) : service.craftjs_json_for(project)
          next if new_json == old_json

          if dry_run || layout.update(craftjs_json: new_json)
            reporter.add_change(
              { layout_id: layout.id, node_ids: old_json.keys },
              { layout_id: layout.id, node_ids: new_json.keys },
              context: context
            )
          else
            reporter.add_error(layout.errors.details, context: context)
          end
        end
      end
    end

    reporter.report!('move_project_files_to_page_builder.json', verbose: true)
    puts "\nDRY RUN — no changes written. Re-run with DRY_RUN=false to execute.\n" if dry_run
  end
end

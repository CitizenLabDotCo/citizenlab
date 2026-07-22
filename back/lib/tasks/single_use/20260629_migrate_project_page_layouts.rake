# frozen_string_literal: true

# Creates an additive, idempotent `project_page` layout for every project that
# has a `project_description` layout, via ContentBuilder::ProjectPageLayoutService.
# Dry-run by default (DRY_RUN=false writes).
#
#   bin/rake single_use:migrate_project_page_layouts                # dry-run
#   DRY_RUN=false bin/rake single_use:migrate_project_page_layouts  # execute
namespace :single_use do
  desc 'Create project_page layouts from existing project_description layouts'
  task migrate_project_page_layouts: :environment do
    dry_run = ENV['DRY_RUN'] != 'false'
    reporter = ScriptReporter.new
    layout_service = ContentBuilder::ProjectPageLayoutService.new

    Tenant.safe_switch_each do |tenant|
      descriptions = ContentBuilder::Layout.where(code: 'project_description', content_buildable_type: 'Project')
      next if descriptions.empty?

      existing_project_ids = ContentBuilder::Layout
        .where(code: ContentBuilder::ProjectPageLayoutService::CODE, content_buildable_type: 'Project')
        .pluck(:content_buildable_id)
        .to_set

      reporter.add_processed_tenant(tenant)

      descriptions.find_each do |description|
        project_id = description.content_buildable_id
        next if existing_project_ids.include?(project_id) # idempotent

        craftjs_json = layout_service.from_description_craftjs(description.craftjs_json)
        layout = ContentBuilder::Layout.new(
          content_buildable_type: 'Project',
          content_buildable_id: project_id,
          code: ContentBuilder::ProjectPageLayoutService::CODE,
          enabled: true,
          craftjs_json: craftjs_json
        )

        context = { tenant: tenant.host, project_id: project_id }

        if dry_run
          reporter.add_create('ContentBuilder::Layout', layout.attributes, context: context)
        elsif layout.save
          reporter.add_create('ContentBuilder::Layout', { id: layout.id }.merge(layout.attributes), context: context)
        else
          reporter.add_error(layout.errors.details, context: context)
        end
      end
    end

    reporter.report!('migrate_project_page_layouts.json', verbose: true)
    puts "\nDRY RUN — no changes written. Re-run with DRY_RUN=false to execute.\n" if dry_run
  end
end

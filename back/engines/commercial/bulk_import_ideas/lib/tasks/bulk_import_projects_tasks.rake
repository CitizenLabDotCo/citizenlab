# frozen_string_literal: true

# Usage:
# rake bulk_import:projects[false, 'demo.stg.govocal.com', 'nl-BE']
# NOTE: FOR DEVELOPMENT/DEBUG use only - only works with files already unzipped into the tmp/import_files/TENANT_SCHEMA directory
# For production use, use the admin interface at /admin/project-importer
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :projects, %i[preview_only host locale] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host] || 'localhost'
    Rails.logger.info "Importing projects for tenant: #{tenant.host}"

    tenant.switch do
      preview_only = args[:preview_only] ? args[:preview_only] == 'true' : false
      locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first # TODO: pass the locale to the extractor
      import_user = User.admin.order(:created_at).first

      # TODO: Extract & import users from an xlsx files in the ZIP

      # Extract & import projects, phases and content from the unzipped xlsx files currently on the file system
      import_path = "tmp/import_files/#{tenant.schema_name}"
      project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(locale, import_path)
      projects = project_extractor.projects
      importer = BulkImportIdeas::Importers::ProjectImporter.new(import_user, locale)

      if preview_only
        importer.preview(projects)
      else
        importer.import(projects)
      end

      importer.import_log.each do |log_message|
        Rails.logger.info log_message
      end

      Rails.logger.info 'COMPLETE'
    end
  end
end

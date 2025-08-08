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
      locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first
      import_user = User.admin.order(:created_at).first
      import_path = "tmp/import_files/#{tenant.schema_name}"

      # Extract users from users.xlsx on the file system from the ZIP file
      user_extractor = BulkImportIdeas::Extractors::UserExtractor.new(locale, nil, import_path)
      users = user_extractor.users
      user_custom_fields = user_extractor.custom_fields

      # Extract & import projects, phases and content from projects.xlsx and other xlsx files on the file system from the ZIP file
      project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(locale, nil, import_path)
      projects = project_extractor.projects
      importer = BulkImportIdeas::Importers::ProjectImporter.new(import_user, locale)

      # Import or preview the projects and users
      if preview_only
        importer.preview(projects, users, user_custom_fields)
      else
        importer.import(projects, users, user_custom_fields)
      end

      importer.import_log.each do |log_message|
        Rails.logger.info log_message
      end

      Rails.logger.info 'COMPLETE'
    end
  end
end

# frozen_string_literal: true

require 'zip'

# Usage:
# rake bulk_import:projects['demo.stg.govocal.com', 'nl-BE']
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :projects, %i[host locale] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host] || 'localhost'
    locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first
    import_user = User.find_by email: 'admin@govocal.com' # TODO: Find the first admin user for the tenant

    Rails.logger.info "Importing projects for tenant: #{tenant.host}"

    tenant.switch do
      upload_path = 'tmp/import_files'
      import_path = "#{upload_path}/#{tenant.schema_name}"
      import_zip = "#{import_path}.zip"

      if File.exist? import_zip
        # Unzip the import file - named for the tenant_schema
        unzip_import_file(import_zip, upload_path)

        # TODO: Extract & import users from an xlsx files in the ZIP

        # Extract & import projects, phases and content from the xlsx files in the ZIP
        project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(import_path)
        projects = project_extractor.projects
        imported_projects = BulkImportIdeas::Importers::ProjectImporter.new(import_user, locale).import(projects)

        Rails.logger.info "IMPORTED #{imported_projects.count} projects"
      else
        Rails.logger.error("FILE #{import_zip} does not exist")
      end
    end
  end
end

def unzip_import_file(file, destination)
  Zip::File.open(file) do |zip_file|
    zip_file.each do |entry|
      entry_path = File.join(destination, entry.name)
      FileUtils.mkdir_p(File.dirname(entry_path))
      zip_file.extract(entry, entry_path) unless File.exist?(entry_path)
    end
  end
end

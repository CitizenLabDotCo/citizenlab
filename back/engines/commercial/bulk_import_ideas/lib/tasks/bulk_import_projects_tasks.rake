# frozen_string_literal: true

require 'zip'

# Usage:
# rake bulk_import:projects[false, 'demo.stg.govocal.com', 'nl-BE']
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :projects, %i[preview_only host locale] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host] || 'localhost'
    Rails.logger.info "Importing projects for tenant: #{tenant.host}"

    tenant.switch do
      preview_only = args[:preview_only] ? args[:preview_only] == 'true' : false
      locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first # TODO: pass the locale to the extractor
      import_user = User.admin.order(:created_at).first # TODO: The first admin user for the tenant

      upload_path = 'tmp/import_files'
      import_path = "#{upload_path}/#{tenant.schema_name}"
      import_zip = "#{import_path}.zip"

      if File.exist? import_zip
        # Remove previous files if they exist
        FileUtils.rm_rf(import_path) if Dir.exist?(import_path)

        # Unzip the import file - named for the tenant_schema
        unzip_import_file(import_zip, upload_path)

        # TODO: Extract & import users from an xlsx files in the ZIP

        # Extract & import projects, phases and content from the xlsx files in the ZIP
        project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(import_path)
        projects = project_extractor.projects

        # Logout what we are importing
        projects.each do |project|
          Rails.logger.info "IMPORTING PROJECT: #{project[:title_multiloc][locale]}"
          project[:phases].each do |phase|
            Rails.logger.info "  PHASE: #{phase[:title_multiloc][locale]}"
            Rails.logger.info "    Start: #{phase[:start_at]}, End: #{phase[:end_at]}"
            Rails.logger.info "    Participation Method: #{phase[:participation_method]}"
            Rails.logger.info "    Ideas: #{phase[:idea_rows].count}"
            Rails.logger.info "    Idea Custom Fields: #{phase[:idea_custom_fields].count}"
            phase[:idea_custom_fields]&.each do |field|
              Rails.logger.info "        Field: #{field[:title_multiloc][locale]} (#{field[:input_type]})"
            end
            Rails.logger.info "    User Custom Fields: #{phase[:user_custom_fields].count}"
          end
        end

        break if preview_only

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

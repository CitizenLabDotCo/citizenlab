# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ProjectImportController < ApplicationController
    def bulk_create_projects
      base64_zip = project_import_params[:file]
      locale = project_import_params[:locale]
      upload_path = 'tmp/import_files'
      import_path = "#{upload_path}/#{Tenant.current.schema_name}"

      # Remove previous files if they exist
      FileUtils.rm_rf(import_path)

      # Unzip the import file - named for the tenant_schema
      unzip_base64_encoded_zip(base64_zip, upload_path)

      # TODO: Extract & import users from an xlsx files in the ZIP

      # Extract & import projects, phases and content from the xlsx files in the ZIP
      project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(locale, import_path)
      projects = project_extractor.projects
      importer = BulkImportIdeas::Importers::ProjectImporter.new(current_user, locale)
      num_projects = projects.count
      import_id = importer.import_async(projects)

      # TODO: No preview for projects do by creating new objects with the logs from importer.preview(projects)

      authorize Project.first # TODO: Fix this authorization
      render json: {
        data: {
          type: 'bulk_import_projects',
          id: import_id,
          attributes: {
            projects_to_import: num_projects
          }
        }
      }
    end

    def show_project_import
      import_id = params[:import_id]
      project_import = BulkImportIdeas::ProjectImport.where(import_id: import_id)

      authorize Project.first # TODO: Fix this authorization
      render json: WebApi::V1::ProjectImportSerializer.new(
        project_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    private

    def project_import_params
      params
        .require(:import)
        .permit(%i[file locale])
    end

    def unzip_base64_encoded_zip(base64_zip, destination)
      # Strip out data;...base64 prefix if it's there
      start = base64_zip.index(';base64,')
      pure_base64 = start ? base64_zip[(start + 8)..] : base64_zip

      # Decode the base64 string
      decoded_zip = Base64.decode64(pure_base64)

      # Write the decoded content to a temporary file
      temp_zip_path = 'tmp/temp.zip'
      File.binwrite(temp_zip_path, decoded_zip)

      # Extract the contents of the ZIP file
      Zip::File.open(temp_zip_path) do |zip_file|
        zip_file.each do |entry|
          entry_path = File.join(destination, entry.name)
          FileUtils.mkdir_p(File.dirname(entry_path))
          zip_file.extract(entry, entry_path) unless File.exist?(entry_path)
        end
      end

      # Clean up the temporary file
      File.delete(temp_zip_path)
    end
  end
end

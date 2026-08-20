# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ProjectImportController < ApplicationController
    before_action :authorize_project_import

    def bulk_create_projects
      base64_zip = project_import_params[:file]
      locale = project_import_params[:locale]
      preview = project_import_params[:preview]

      upload_path = 'tmp/import_files'
      import_path = "#{upload_path}/#{Tenant.current.schema_name}"

      # Remove previous files if they exist
      FileUtils.rm_rf(import_path)

      # Unzip the import file - named for the tenant_schema
      unzip_base64_encoded_zip(base64_zip, upload_path)

      # Extract projects, phases and content from the xlsx files in the ZIP
      project_extractor = BulkImportIdeas::Extractors::ProjectExtractor.new(locale, nil, import_path)
      projects = project_extractor.projects

      # Extract users from users.xlsx in the ZIP file
      config = project_extractor.import_config # We reuse the config from the project extractor
      user_extractor = BulkImportIdeas::Extractors::UserExtractor.new(locale, config, import_path)
      users, user_custom_fields = user_extractor.user_details(projects)

      # Preview or import the data
      if preview
        previewer = BulkImportIdeas::Previewers::ProjectPreviewer.new(current_user, locale)
        import_id = previewer.preview_async(projects, users, user_custom_fields)
      else
        importer = BulkImportIdeas::Importers::ProjectImporter.new(current_user, locale)
        import_id = importer.import_async(projects, users, user_custom_fields)
      end

      num_projects = projects.count
      render json: {
        data: {
          type: 'bulk_import_projects',
          id: import_id,
          attributes: {
            num_imports: num_projects + (users.any? ? 1 : 0), # +1 for the user import if users are present
            preview: preview
          }
        }
      }
    end

    def show_project_import
      import_id = params[:import_id]
      project_import = BulkImportIdeas::ProjectImport.where(import_id: import_id)

      render json: WebApi::V1::ProjectImportSerializer.new(
        project_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    private

    # Authorize before the controller extracts any file (see #bulk_create_projects).
    # A project import makes top-level draft projects. Thus it needs the same rights
    # as project creation. This runs as a before_action, so it completes before the
    # controller body reads and unzips the uploaded archive.
    def authorize_project_import
      authorize Project.new(admin_publication: AdminPublication.new(publication_status: 'draft')), :create?
    end

    def project_import_params
      params
        .require(:import)
        .permit(%i[file locale preview])
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
          ensure_within_destination!(entry_path, destination)
          FileUtils.mkdir_p(File.dirname(entry_path))
          zip_file.extract(entry, entry_path) unless File.exist?(entry_path)
        end
      end

      # Clean up the temporary file
      File.delete(temp_zip_path)
    end

    # Prevent Zip Slip. Reject an entry when its resolved path goes outside the
    # destination directory (for example, an entry name that contains "..").
    def ensure_within_destination!(entry_path, destination)
      allowed_root = File.expand_path(destination)
      resolved = File.expand_path(entry_path)
      return if resolved == allowed_root || resolved.start_with?("#{allowed_root}/")

      raise BulkImportIdeas::Error.new('bulk_import_unsafe_zip_entry', value: entry_path)
    end
  end
end

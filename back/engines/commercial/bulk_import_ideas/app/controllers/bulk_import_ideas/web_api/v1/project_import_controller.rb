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

    # Authorize in a before_action, so it completes before #bulk_create_projects
    # reads and unzips the uploaded archive. Pundit infers the policy query from
    # the action name (bulk_create_projects? / show_project_import?). The engine
    # patch on ProjectPolicy limits both to super admins.
    def authorize_project_import
      authorize Project
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
          entry_path = safe_entry_path(destination, entry.name)
          FileUtils.mkdir_p(File.dirname(entry_path))
          zip_file.extract(entry, entry_path) unless File.exist?(entry_path)
        end
      end
    ensure
      # Clean up the temporary file, also when extraction raises
      FileUtils.rm_f(temp_zip_path) if temp_zip_path
    end

    # Prevent Zip Slip. Return the extraction path of the entry, or raise an
    # ApiError (rendered as a 422 by ApplicationController) when the resolved path
    # goes outside the destination directory (for example, an entry name that
    # contains "..").
    def safe_entry_path(destination, entry_name)
      allowed_root = File.expand_path(destination)
      entry_path = File.join(destination, entry_name)
      resolved = File.expand_path(entry_path)
      return entry_path if resolved == allowed_root || resolved.start_with?("#{allowed_root}/")

      raise ApiError.new(:bulk_import_unsafe_zip_entry, field: :file, value: entry_name)
    end
  end
end

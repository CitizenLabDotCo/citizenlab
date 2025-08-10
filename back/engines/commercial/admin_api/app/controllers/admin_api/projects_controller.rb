# frozen_string_literal: true

module AdminApi
  class ProjectsController < AdminApiController
    def index
      projects = Project.includes(
        { admin_publication: { parent: [:publication] } },
        :project_images
      )
      render json: projects, adapter: :attributes
    end

    def template_export
      project = Project.find(params[:id])
      options = template_export_params.to_h.symbolize_keys
      options[:shift_timestamps] = options[:shift_timestamps].to_i if options[:shift_timestamps]
      template = ProjectCopyService.new.export project, **options
      render json: { template_yaml: template.to_yaml }
    end

    def template_import
      folder_id = template_import_params[:folder_id]
      template_yaml = template_import_params[:template_yaml]
      local_creator = local_creator_from_jwt

      job = CopyProjectJob.perform_later(template_yaml, folder_id, local_creator)
    rescue StandardError => e
      ErrorReporter.report(e)
      error_key = e.respond_to?(:error_key) ? e.error_key : :bad_template
      message = e.message
      raise ClErrors::TransactionError.new(error_key: error_key, message: message)
    else
      render json: { job_id: job.job_id }, status: :accepted
    end

    def template_import_params
      params.require(:project).permit(:template_yaml, :folder_id, :local_create)
    end

    def template_export_params
      params.require(:project).permit(
        :include_ideas,
        :anonymize_users,
        :translate_content,
        :shift_timestamps,
        :new_slug,
        :timeline_start_at,
        :new_publication_status,
        new_title_multiloc: CL2_SUPPORTED_LOCALES
      )
    end

    private

    def local_creator_from_jwt
      return nil unless template_import_params[:local_create] == true

      user_id = jwt_payload['sub']
      user = User.find_by(id: user_id)

      # TODO: comment this line out for 1 month, until all JWTs are updated
      raise "User with id #{user_id.inspect} from JWT payload not found" if user.nil?

      user
    end

    def jwt_payload
      token = request.headers['X-JWT']
      # TODO: comment this line out for 1 month, until all JWTs are updated
      raise 'Missing X-JWT header' if token.blank?

      auth_token = AuthToken::AuthToken.new(token: token)

      auth_token.payload
    end
  end
end

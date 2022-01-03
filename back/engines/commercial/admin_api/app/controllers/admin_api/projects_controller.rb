# frozen_string_literal: true

module AdminApi
  class ProjectsController < AdminApiController
    def index
      projects = Project.all.map do |project|
        project_hash = project.as_json
        project_hash['map_config_id'] = project.map_config_id
        project_hash
      end

      render json: projects
    end

    def template_export
      project = Project.find(params[:id])
      options = template_export_params.to_h.symbolize_keys
      options[:shift_timestamps] = options[:shift_timestamps].to_i if options[:shift_timestamps]
      template = ProjectCopyService.new.export project, **options
      render json: { template_yaml: template.to_yaml }
    end

    def template_import
      template = YAML.load(template_import_params[:template_yaml])
      ProjectCopyService.new.import(template)
      DumpTenantJob.perform_later(Tenant.current) if defined?(NLP)
    rescue StandardError => e
      ErrorReporter.report(e)
      raise ClErrors::TransactionError.new(error_key: :bad_template)
    else
      head :ok
    end

    def template_import_params
      params.require(:project).permit(:template_yaml)
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
  end
end

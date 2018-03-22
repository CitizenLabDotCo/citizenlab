class AdminApi::ProjectsController < AdminApi::AdminApiController

  def index
    @projects = Project.all
    render json: @projects
  end

  def template_export
    project = Project.find(template_export_params[:id])
    template = ProjectCopyService.new.export project
    render json: {template_yaml: template.to_yaml}
  end

  def template_import
    template = YAML.load(template_import_params[:template_yaml])
    ProjectCopyService.new.import template
    head :ok
  end

  def template_export_params
    params.require(:project).permit(
      :id
    )
  end

  def template_import_params
    params.require(:project).permit(
      :template_yaml
    )
  end

end

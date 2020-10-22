# frozen_string_literal: true

#
# The Controller responsible for changing the ideas_order in a given @project
#
class WebApi::V1::Projects::IdeasOrdersController < WebApi::V1::Projects::BaseController
  def update
    @side_effects = SideFxPhaseService.new
    @side_effects.before_update(@project, current_user)
    if @project.update(project_params)
      @side_effects.after_update(@project, current_user)
      render json: serialized_project(params: project_params.to_h), status: :ok
    else
      render json: serialized_project_errors, status: :unprocessable_entity
    end
  end

  private

  def project_params
    params.require(:project).permit(:ideas_order)
  end
end

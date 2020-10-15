# frozen_string_literal: true

#
# The Controller responsible for changing the ideas_order in a given @project
#
class WebApi::V1::Projects::IdeasOrdersController < WebApi::V1::Projects::BaseController
  def update
    run_side_effect :before_update
    if @project.update(project_params)
      run_side_effect :after_update
      render json: serialized_project(includes: :ideas), status: :ok
    else
      render json: serialized_project_errors, status: :unprocessable_entity
    end
  end

  private

  # TODO: move to Rails Observer
  def run_side_effect(callback_name)
    @run_side_effect ||= SideFxProjectService.new.tap do |service|
      service.send(callback_name, @project, current_user)
    end
  end

  def project_params
    params.require(:project).permit(:ideas_order)
  end
end

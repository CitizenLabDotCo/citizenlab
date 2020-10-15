# frozen_string_literal: true

module Projects
  #
  # The Controller responsible for changing the ideas_order in a given @project
  #
  class IdeasOrderController < Projects::BaseController
    def update
      run_side_effect :before_update
      if @project.update(project_params)
        run_side_effect :after_update
        render json: serialized_project, status: :ok
      else
        render json: serialized_project_errors, status: :unprocessable_entity
      end
    end

    private

    # TODO: move to Rails Observer
    def run_side_effect(lifecycle_method)
      @run_side_effect ||= SideFxProjectService.new.tap do |service|
        service.send(lifecycle_method, @project, current_user)
      end
    end

    def project_params
      params.require(:project).permit(:ideas_order)
    end
  end
end

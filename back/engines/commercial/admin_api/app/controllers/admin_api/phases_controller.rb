# frozen_string_literal: true

module AdminApi
  class PhasesController < AdminApiController
    before_action :set_project

    def index
      @phases = @project
        .phases

      # This uses default model serialization
      render json: @phases, adapter: :attributes
    end

    private

    def set_project
      @project = Project.find(params[:project_id])
    end
  end
end

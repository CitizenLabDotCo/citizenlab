# frozen_string_literal: true

module AdminApi
  class ParticipantsController < AdminApiController
    before_action :set_project

    def participants_count
      count = ParticipantsService.new.project_participants_count(@project)
      render json: { count: }
    end

    private

    def set_project
      @project = Project.find(params[:id])
    end
  end
end

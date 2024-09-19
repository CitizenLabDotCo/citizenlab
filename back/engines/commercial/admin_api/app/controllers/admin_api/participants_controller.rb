# frozen_string_literal: true

module AdminApi
  class ParticipantsController < AdminApiController
    before_action :set_project

    def participants_count
      use_cache = params[:use_cache].to_s != 'false' # Default to using cache if the param is not provided

      # Depending on the `use_cache` param, use the cached or uncached method
      count = if use_cache
                ParticipantsService.new.project_participants_count(@project)
              else
                ParticipantsService.new.project_participants_count_uncached(@project)
              end

      render json: { count: }
    end

    private

    def set_project
      @project = Project.find(params[:id])
    end
  end
end

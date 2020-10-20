module AdminApi
  class IdeasController < AdminApiController

    def show
      @idea = Idea.find(params[:id])
      # This uses default model serialization
      render json: @idea, adapter: :json
    end

  end
end

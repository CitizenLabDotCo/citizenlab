module AdminApi
  class IdeasController < AdminApiController

    def show
      @idea = Idea.find(params[:id])
      render json: @idea, adapter: :json
    end

  end
end

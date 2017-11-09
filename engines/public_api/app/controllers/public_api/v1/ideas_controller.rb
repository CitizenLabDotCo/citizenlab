
module PublicApi

  class V1::IdeasController < PublicApiController

    def index
      @ideas = Idea
        .published
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
        .includes(:idea_images, :project, :idea_status)
        .order_trending

      
      render json: @ideas, 
        each_serializer: V1::IdeaSerializer, 
        adapter: :json,
        meta: meta_properties(@ideas)
    end

    def show
      @idea = Idea.find(params[:id])
      render json: @idea, 
        serializer: V1::IdeaSerializer,
        adapter: :json
    end

    def meta_properties relation
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end

  end

end
module PublicApi

  class V1::IdeasController < PublicApiController

    before_action :set_idea, only: [:show]

    def index
      @ideas = PublicApi::IdeaPolicy::Scope.new(current_publicapi_apiclient, Idea).resolve
      @ideas = @ideas
        .published
        .page(params.dig(:page_number))
        .per([params.dig(:page_size)&.to_i || 12, 24].min)
        .includes(:idea_images, :project, :idea_status)
        .order_trending

      
      render json: @ideas, 
        each_serializer: V1::IdeaSerializer, 
        adapter: :json,
        meta: meta_properties(@ideas)
    end

    def show
      render json: @idea, 
        serializer: V1::IdeaSerializer,
        adapter: :json
    end

    def set_idea
      @idea = Idea.find(params[:id])
      authorize PolicyWrappedIdea.new(@idea)
    end

    def meta_properties relation
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end

  end

end
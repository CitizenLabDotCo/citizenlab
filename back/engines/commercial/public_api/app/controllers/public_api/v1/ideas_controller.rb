module PublicApi

  class V1::IdeasController < PublicApiController

    before_action :set_idea, only: [:show]

    def index
      @ideas = PublicApi::IdeaPolicy::Scope.new(current_publicapi_apiclient, Idea).resolve
      @ideas = @ideas
        .published
        .page(params.dig(:page_number))
        .per([params.dig(:page_size)&.to_i || 12, 24].min) # default is 12, maximum is 24
        .includes(:idea_images, :project, :idea_status)
      # kaminari fails to get the correct total pages when
      # executing complex queries (other values than ideas.*
      # are calculated, and kaminari wraps a count around it,
      # resulting in a syntax error). We therefore acquire
      # the count before the complex query.
      @total_pages = @ideas.total_pages
      @ideas = TrendingIdeaService.new.sort_trending @ideas
      
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
        total_pages: @total_pages
      }
    end

  end

end
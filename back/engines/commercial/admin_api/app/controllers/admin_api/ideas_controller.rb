# frozen_string_literal: true

module AdminApi
  class IdeasController < AdminApiController
    def index
      ideas = ::IdeaPolicy::Scope.new(nil, Idea)
        .resolve
        .includes(:idea_images)
        .published

      ideas = sort_ideas(ideas)
      ideas = ideas.with_some_input_topics(InputTopic.where(id: params[:topics])) if params[:topics].present?
      ideas = ideas.where(project_id: params[:projects]) if params[:projects].present?
      ideas = ideas.limit(params[:limit]&.to_i || 5)

      render json: ideas, each_serializer: AdminApi::IdeaSerializer, adapter: :json, include: [:idea_images]
    end

    def show
      @idea = Idea.find(params[:id])
      render json: @idea, adapter: :json
    end

    private

    def sort_ideas(ideas)
      case params[:sort]
      when 'trending' then TrendingIdeaService.new.sort_trending(ideas)
      when 'popular' then ideas.order_popular
      when 'new' then ideas.order_new
      else ideas
      end
    end
  end
end

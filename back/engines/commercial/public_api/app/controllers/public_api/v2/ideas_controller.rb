# frozen_string_literal: true

module PublicApi
  class V2::IdeasController < PublicApiController
    before_action :set_idea, only: [:show]

    def index
      ideas = Idea.all
        .includes(:idea_images, :project, :idea_status)
        .page(params[:page_number])
        .per(num_per_page)
      ideas = common_date_filters ideas

      # TODO: Set the paging defaults elsewhere in public API controller
      #
      # TODO: Is the following still the case? No longer a complex query
      # kaminari fails to get the correct total pages when
      # executing complex queries (other values than ideas.*
      # are calculated, and kaminari wraps a count around it,
      # resulting in a syntax error). We therefore acquire
      # the count before the complex query.
      total_pages = ideas.total_pages

      render json: ideas,
        each_serializer: V2::IdeaSerializer,
        adapter: :json,
        meta: meta_properties(ideas, total_pages)
    end

    def show
      render json: @idea,
        serializer: V2::IdeaSerializer,
        adapter: :json
    end

    private

    def set_idea
      @idea = Idea.find(params[:id])
    end

    def meta_properties(relation, total_pages)
      {
        current_page: relation.current_page,
        total_pages: total_pages
      }
    end
  end
end

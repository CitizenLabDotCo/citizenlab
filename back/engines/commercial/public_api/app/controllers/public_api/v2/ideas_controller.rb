# frozen_string_literal: true

module PublicApi
  class V2::IdeasController < PublicApiController
    include DeletedItemsAction

    def index
      ideas = IdeasFinder.new(
        Idea.order(created_at: :desc),
        **finder_params
      ).execute

      list_items(ideas, V2::IdeaSerializer, includes: %i[idea_images project idea_status])
    end

    def show
      show_item Idea.find(params[:id]), V2::IdeaSerializer
    end

    private

    def finder_params
      params
        .permit(:author_id, :project_id, :type, topic_ids: [])
        .to_h
        .symbolize_keys
    end
  end
end

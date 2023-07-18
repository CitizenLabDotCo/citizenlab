# frozen_string_literal: true

module PublicApi
  class V2::IdeasController < PublicApiController
    def index
      ideas = IdeasFinder.new(
        Idea.includes(:idea_images, :project, :idea_status).order(created_at: :desc),
        **finder_params
      ).execute

      # TODO: Add filter by project_id, topic_name
      # TODO: Only return ideas, separate endpoint for survey responses

      list_items(ideas, V2::IdeaSerializer)
    end

    def show
      show_item Idea.find(params[:id]), V2::IdeaSerializer
    end

    private

    def finder_params
      params
        .permit(:user_id, :project_id)
        .to_h
        .symbolize_keys
    end
  end
end

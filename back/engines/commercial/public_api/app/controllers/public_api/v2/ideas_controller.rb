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

    def create
      idea_params = permitted_idea_params
      idea = Idea.new(idea_params)

      if idea.save
        show_item idea, V2::IdeaSerializer, status: :created
      else
        render json: { errors: idea.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      idea = Idea.find(params[:id])
      update_params = permitted_idea_params

      if idea.update(update_params)
        show_item idea, V2::IdeaSerializer
      else
        render json: { errors: idea.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def finder_params
      params
        .permit(:author_id, :project_id, :type, topic_ids: [])
        .to_h
        .symbolize_keys
    end

    def permitted_idea_params
      params.require(:idea).permit(
        :project_id,
        :assignee_id,
        :idea_status_id,
        title_multiloc: {},
        body_multiloc: {},
        topic_ids: [],
        phase_ids: []
      )
    end
  end
end

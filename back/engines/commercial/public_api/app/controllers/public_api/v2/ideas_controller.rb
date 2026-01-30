# frozen_string_literal: true

module PublicApi
  class V2::IdeasController < PublicApiController
    include DeletedItemsAction

    def index
      ideas = IdeasFinder.new(
        Idea.order(created_at: :desc),
        **finder_params
      ).execute

      list_items(ideas, V2::IdeaSerializer, includes: %i[idea_images project creation_phase idea_status])
    end

    def show
      show_item Idea.find(params[:id]), V2::IdeaSerializer
    end

    def create
      idea_params = create_params
      idea = Idea.new(idea_params)

      side_fx.before_create(idea, nil)
      if idea.save
        side_fx.after_create(idea, nil, nil)
        show_item idea, V2::IdeaSerializer, status: :created
      else
        render json: { errors: idea.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      idea = Idea.find(params[:id])

      side_fx.before_update(idea, nil)
      if idea.update(update_params)
        side_fx.after_update(idea, nil)
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

    def create_params
      result = params.require(:idea).permit(
        :project_id,
        :assignee_id,
        :idea_status_id,
        title_multiloc: {},
        body_multiloc: {},
        topic_ids: [],
        input_topic_ids: [],
        phase_ids: []
      )
      result[:input_topic_ids] = result.delete(:topic_ids) if result.key?(:topic_ids)
      result
    end

    def update_params
      result = params.require(:idea).permit(
        :assignee_id,
        :idea_status_id,
        title_multiloc: {},
        body_multiloc: {},
        topic_ids: [],
        input_topic_ids: [],
        phase_ids: []
      )

      result[:input_topic_ids] = result.delete(:topic_ids) if result.key?(:topic_ids)
      result
    end

    def side_fx
      @side_fx ||= SideFxIdeaService.new
    end
  end
end

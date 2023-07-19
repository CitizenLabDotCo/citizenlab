# frozen_string_literal: true

module PublicApi
  class V2::IdeasController < PublicApiController
    def index
      ideas = Idea
        .order(created_at: :desc)
        .includes(:idea_images, :project, :idea_status)
        .page(params[:page_number])
        .per(num_per_page)

      ideas = common_date_filters(ideas)

      # TODO: Add filter by project_id, user_id, topic_name
      # TODO: Only return ideas, separate endpoint for survey responses

      render json: ideas,
        each_serializer: V2::IdeaSerializer,
        adapter: :json,
        meta: meta_properties(ideas)
    end

    def show
      show_item Idea.find(params[:id]), V2::IdeaSerializer
    end

    def deleted
      deleted_items = Activity.where(
        item_type: 'Idea',
        action: 'deleted',
      )

      list_items(deleted_items, V2::DeletedItemSerializer, root_key: :deleted_items)
    end
  end
end

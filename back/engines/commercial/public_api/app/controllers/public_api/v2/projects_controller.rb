# frozen_string_literal: true

module PublicApi
  class V2::ProjectsController < PublicApiController
    include DeletedItemsAction

    def index
      projects = ProjectsFinder.new(
        Project.includes(:project_images).includes(:map_config).order(created_at: :desc),
        **finder_params
      ).execute

      # TODO: Add filter by topic
      list_items(projects, V2::ProjectSerializer)
    end

    def show
      show_item Project.find(params[:id]), V2::ProjectSerializer
    end

    private

    def finder_params
      params.permit(:folder_id, :publication_status, topic_ids: []).to_h.tap do |params|
        if params[:publication_status]
          validate_publication_status!(params[:publication_status])
        end
      end.symbolize_keys
    end

    def validate_publication_status!(status)
      return if status.in?(AdminPublication::PUBLICATION_STATUSES)

      raise InvalidEnumParameterValueError.new(
        'publication_status', status, AdminPublication::PUBLICATION_STATUSES
      )
    end
  end
end

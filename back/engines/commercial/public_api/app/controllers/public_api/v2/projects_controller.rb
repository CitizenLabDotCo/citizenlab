# frozen_string_literal: true

module PublicApi
  class V2::ProjectsController < PublicApiController
    include DeletedItemsAction

    def index
      projects = ProjectsFinder.new(
        Project.order(created_at: :desc),
        **finder_params
      ).execute

      list_items(projects, V2::ProjectSerializer, includes: [:project_images, :map_config, { admin_publication: :parent }])
    end

    def show
      show_item Project.find(params[:id]), V2::ProjectSerializer
    end

    private

    def finder_params
      params.permit(:folder_id, :publication_status, topic_ids: [], area_ids: []).to_h.tap do |params|
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

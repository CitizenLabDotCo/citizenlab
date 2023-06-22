# frozen_string_literal: true

module PublicApi
  class V2::ProjectsController < PublicApiController
    def index
      projects = ProjectsFinder.new(
        Project.includes(:project_images).includes(:map_config).order(created_at: :desc),
        **finder_params
      ).execute

      # TODO: Add filter by topic, status
      list_items(projects, V2::ProjectSerializer)
    end

    def show
      show_item Project.find(params[:id]), V2::ProjectSerializer
    end

    private

    def finder_params
      params.permit(:folder_id).to_h.symbolize_keys
    end
  end
end

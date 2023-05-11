# frozen_string_literal: true

module PublicApi
  class V2::ProjectsController < PublicApiController
    before_action :set_project, only: [:show]

    def index
      @projects = Project.all
        .includes(:project_images)
        .includes(:map_config)
        .order(created_at: :desc)
        .page(params[:page_number])
        .per([params[:page_size]&.to_i || 12, 24].min)

      render json: @projects,
        each_serializer: V2::ProjectSerializer,
        adapter: :json,
        meta: meta_properties(@projects)
    end

    def show
      render json: @project,
        serializer: V2::ProjectSerializer,
        adapter: :json
    end

    private

    def set_project
      @project = Project.find(params[:id])
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end
  end
end

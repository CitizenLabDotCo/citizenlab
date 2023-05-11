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
        .per(num_per_page)
      @projects = common_date_filters @projects

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
  end
end

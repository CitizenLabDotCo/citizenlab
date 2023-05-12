# frozen_string_literal: true

module PublicApi
  class V2::ProjectsController < PublicApiController
    def index
      @projects = Project.all
        .includes(:project_images)
        .includes(:map_config)
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)
      @projects = common_date_filters @projects

      # TODO: Add filter by topic, status & folder_id

      render json: @projects,
        each_serializer: V2::ProjectSerializer,
        adapter: :json,
        meta: meta_properties(@projects)
    end

    def show
      show_item Project.find(params[:id]), V2::ProjectSerializer
    end
  end
end

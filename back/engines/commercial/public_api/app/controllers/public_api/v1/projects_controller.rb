module PublicApi

  class V1::ProjectsController < PublicApiController

    before_action :set_project, only: [:show]

    def index
      @projects = PublicApi::ProjectPolicy::Scope.new(current_publicapi_apiclient, Project).resolve
      @projects = @projects
        .includes(:project_images)
        .order(created_at: :desc)
        .page(params.dig(:page_number))
        .per([params.dig(:page_size)&.to_i || 12, 24].min)

      render json: @projects, 
        each_serializer: V1::ProjectSerializer, 
        adapter: :json,
        meta: meta_properties(@projects)
    end

    def show
      render json: @project, 
        serializer: V1::ProjectSerializer,
        adapter: :json
    end

    def set_project
      @project = Project.find(params[:id])
      authorize PolicyWrappedProject.new(@project)
    end

    def meta_properties relation
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end

  end

end
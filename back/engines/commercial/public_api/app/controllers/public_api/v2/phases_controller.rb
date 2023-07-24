# frozen_string_literal: true

module PublicApi
  class V2::PhasesController < PublicApiController
    include DeletedItemsAction

    def index
      list_phases Phase.all
    end

    def by_project
      list_phases Phase.where(project_id: params[:project_id])
    end

    def show
      show_item Phase.find(params[:id]), V2::PhaseSerializer
    end

    private

    def list_phases(base_query)
      phases = base_query
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)

      phases = common_date_filters(phases)
      phases = phase_date_filters(phases)

      render json: phases,
        each_serializer: V2::PhaseSerializer,
        adapter: :json,
        meta: meta_properties(phases)
    end

    def phase_date_filters(base_query)
      base_query = base_query.where(date_filter_where_clause('start_at', params[:start_at])) if params[:start_at]
      base_query = base_query.where(date_filter_where_clause('end_at', params[:end_at])) if params[:end_at]
      base_query
    end
  end
end

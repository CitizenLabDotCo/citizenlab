# frozen_string_literal: true

module PublicApi
  class V2::PhasesController < PublicApiController
    before_action :set_phase, only: [:show]

    def index
      @phases = Phase.all
        .order(created_at: :desc)
        .page(params[:page_number])
        .per([params[:page_size]&.to_i || 12, 24].min)

      render json: @phases,
        each_serializer: V2::PhaseSerializer,
        adapter: :json,
        meta: meta_properties(@phases)
    end

    def by_project
      @phases = Phase.where(project_id: params[:project_id])
        .order(start_at: :asc)
        .page(params[:page_number])
        .per([params[:page_size]&.to_i || 12, 24].min)

      render json: @phases,
        each_serializer: V2::PhaseSerializer,
        adapter: :json,
        meta: meta_properties(@phases)
    end

    def show
      render json: @phase,
        serializer: V2::PhaseSerializer,
        adapter: :json
    end

    private

    def set_phase
      @phase = Phase.find(params[:id])
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end
  end
end

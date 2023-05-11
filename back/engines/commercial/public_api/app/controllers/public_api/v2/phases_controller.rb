# frozen_string_literal: true

module PublicApi
  class V2::PhasesController < PublicApiController
    before_action :set_phase, only: [:show]

    def index
      @phases = Phase.all
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)
      @phases = common_date_filters @phases

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
      @phases = common_date_filters @phases

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
  end
end

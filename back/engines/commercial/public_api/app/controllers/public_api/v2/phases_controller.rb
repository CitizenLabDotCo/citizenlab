# frozen_string_literal: true

module PublicApi
  class V2::PhasesController < PublicApiController
    before_action :set_project, only: [:index]
    before_action :set_phase, only: [:show]

    def index
      # TODO: Remove policy here
      @phases = PublicApi::PhasePolicy::Scope.new(current_publicapi_apiclient, Phase).resolve
      @phases = @phases
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

    def set_project
      @project = Project.find(params[:project_id])
    end

    def set_phase
      @phase = Phase.find(params[:id])
      authorize PolicyWrappedPhase.new(@phase)
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end
  end
end

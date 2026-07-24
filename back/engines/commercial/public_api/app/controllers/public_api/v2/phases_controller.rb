# frozen_string_literal: true

module PublicApi
  class V2::PhasesController < PublicApiController
    include DeletedItemsAction

    def index
      phases = Phase.all
      phases = phases.where(project_id: params[:project_id]) if params[:project_id]
      phases = phase_date_filters(phases)
      list_items phases, V2::PhaseSerializer, includes: [:project]
    end

    def show
      show_item Phase.find(params[:id]), V2::PhaseSerializer
    end

    private

    def phase_date_filters(base_query)
      base_query = base_query.where(start_at: parse_date_range(params[:start_at])) if params[:start_at]
      base_query = base_query.where(end_at: parse_date_range(params[:end_at])) if params[:end_at]
      base_query
    end
  end
end

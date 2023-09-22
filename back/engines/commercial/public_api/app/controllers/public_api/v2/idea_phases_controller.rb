# frozen_string_literal: true

module PublicApi
  class V2::IdeaPhasesController < PublicApiController
    def index
      idea_phases = IdeasPhase
        .where(query_filters)
        .order(:id)
        .page(params[:page_number])
        .per(num_per_page)
      list_items idea_phases, V2::IdeaPhaseSerializer
    end

    private

    def query_filters
      params.permit(:idea_id, :phase_id).to_h
    end
  end
end

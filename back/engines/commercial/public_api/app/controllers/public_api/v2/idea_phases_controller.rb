# frozen_string_literal: true

module PublicApi
  class V2::IdeaPhasesController < PublicApiController
    def index
      list_items IdeasPhase.where(query_filters), V2::IdeaPhaseSerializer
    end

    private

    def query_filters
      params.permit(:idea_id, :phase_id).to_h
    end
  end
end

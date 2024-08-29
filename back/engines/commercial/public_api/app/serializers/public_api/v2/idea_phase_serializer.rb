# frozen_string_literal: true

module PublicApi
  module V2
    class IdeaPhaseSerializer < PublicApi::V2::BaseSerializer
      type :idea_phases
      attributes(:idea_id, :phase_id, :baskets_count, :votes_count, :created_at, :updated_at)
    end
  end
end

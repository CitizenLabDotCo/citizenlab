# frozen_string_literal: true

class WebApi::V1::IdeasPhaseSerializer < WebApi::V1::BaseSerializer
  attributes :baskets_count, :votes_count

  has_one :idea
  has_one :phase
end

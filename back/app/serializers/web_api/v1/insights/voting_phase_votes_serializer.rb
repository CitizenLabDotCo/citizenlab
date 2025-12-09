class WebApi::V1::Insights::VotingPhaseVotesSerializer < WebApi::V1::BaseSerializer
  %i[total_votes group_by custom_field_id options ideas].each do |attr|
    attribute attr do |_phase, params|
      params[attr]
    end
  end
end

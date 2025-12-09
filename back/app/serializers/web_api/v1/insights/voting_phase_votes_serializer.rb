class WebApi::V1::Insights::VotingPhaseVotesSerializer < WebApi::V1::BaseSerializer
  %i[online_votes offline_votes total_votes group_by custom_field_id options ideas grouped_online_votes].each do |attr|
    attribute attr do |_phase, params|
      params[attr]
    end
  end
end

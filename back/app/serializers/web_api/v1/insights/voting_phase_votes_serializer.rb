class WebApi::V1::Insights::VotingPhaseVotesSerializer < WebApi::V1::BaseSerializer
  attribute :thing do |_phase, params|
    params[:thing]
  end
end

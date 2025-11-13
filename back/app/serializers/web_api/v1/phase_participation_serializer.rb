class WebApi::V1::PhaseParticipationSerializer < WebApi::V1::BaseSerializer
  attribute :participation do |phase, params|
    params[:participation_data]
  end

  belongs_to :project
end

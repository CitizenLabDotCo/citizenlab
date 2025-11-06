class WebApi::V1::PhaseParticipationSerializer < WebApi::V1::BaseSerializer
  attributes :participation

  belongs_to :project
end
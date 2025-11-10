class WebApi::V1::PhaseDemographicsSerializer < WebApi::V1::BaseSerializer
  attributes :demographics

  belongs_to :project
end

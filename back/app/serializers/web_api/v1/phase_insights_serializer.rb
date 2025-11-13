class WebApi::V1::PhaseInsightsSerializer < WebApi::V1::BaseSerializer
  attribute :metrics do |_phase, params|
    params[:metrics]
  end

  belongs_to :project
end

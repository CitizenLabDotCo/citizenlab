class WebApi::V1::Insights::PhaseInsightsSerializer < WebApi::V1::BaseSerializer
  attribute :metrics do |_phase, params|
    params[:metrics]
  end

  attribute :demographics do |_phase, params|
    params[:demographics]
  end
end

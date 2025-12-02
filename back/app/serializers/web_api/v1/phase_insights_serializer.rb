class WebApi::V1::PhaseInsightsSerializer < WebApi::V1::BaseSerializer
  attribute :metrics do |_phase, params|
    params[:metrics]
  end

  attribute :demographics do |_phase, params|
    params[:demographics]
  end

  attribute :participants_and_visitors_chart_data do |_phase, params|
    params[:participants_and_visitors_chart_data]
  end

  belongs_to :project
end

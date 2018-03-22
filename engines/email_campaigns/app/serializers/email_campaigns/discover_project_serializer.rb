class EmailCampaigns::DiscoverProjectSerializer < ActiveModel::Serializer
  attributes :id, :url, :title_multiloc

  belongs_to :current_phase, serializer: WebApi::V1::PhaseSerializer

  def url
    FrontendService.new.model_to_url object
  end

  def current_phase
  	TimelineService.new.current_phase object
  end

end
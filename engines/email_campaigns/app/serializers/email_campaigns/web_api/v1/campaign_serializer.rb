module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ActiveModel::Serializer
    attributes :id, :sender, :reply_to, :campaign_name, :subject_multiloc, :body_multiloc, :created_at, :updated_at

    belongs_to :author
    has_many :groups
    
    def campaign_name
      object.class.campaign_name
    end
  end
end

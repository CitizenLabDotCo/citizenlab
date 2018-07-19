module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ActiveModel::Serializer
    attributes :id, :sender, :reply_to, :sent_at, :subject_multiloc, :body_multiloc

    belongs_to :author
    has_many :groups
    
  end
end

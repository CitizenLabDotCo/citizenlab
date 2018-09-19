module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ActiveModel::Serializer
    attributes :id, :campaign_name, :deliveries_count, :created_at, :updated_at

    attribute :enabled, if: -> { object.respond_to? :enabled }
    attribute :schedule, if: -> { object.respond_to? :schedule }
    attribute :sender, if: -> { object.respond_to? :sender }
    attribute :reply_to, if: -> { object.respond_to? :reply_to }
    attribute :subject_multiloc, if: -> { object.respond_to? :subject_multiloc }
    attribute :body_multiloc, if: -> { object.respond_to? :body_multiloc }


    belongs_to :author, if: -> { object.respond_to? :author }
    has_many :groups, if: -> { object.respond_to? :groups }
    
    def campaign_name
      object.class.campaign_name
    end
  end
end

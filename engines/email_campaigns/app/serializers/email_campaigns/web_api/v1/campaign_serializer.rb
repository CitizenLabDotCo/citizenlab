module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ActiveModel::Serializer

    attributes :id, :campaign_name, :admin_campaign_description_multiloc, :created_at, :updated_at
    belongs_to :author

    attribute :enabled, if: :disableable?
    attribute :schedule, if: :schedulable?
    attribute :schedule_multiloc, if: :schedulable?
    attribute :sender, if: :sender_configurable?
    attribute :reply_to, if: :sender_configurable?
    attribute :subject_multiloc, if: :content_configurable?
    attribute :body_multiloc, if: :content_configurable?
    attribute :deliveries_count, if: :trackable?

    has_many :groups, if: :recipient_configurable?
    
    def campaign_name
      object.class.campaign_name
    end

    def schedule_multiloc
      MultilocService.new.block_to_multiloc do |locale|
        object.ic_schedule.to_s
      end
    end

    def admin_campaign_description_multiloc
      object.class.admin_campaign_description_multiloc
    end

    def disableable?
      object.class.included_modules.include?(Disableable)
    end

    def schedulable?
      object.class.included_modules.include?(Schedulable)
    end

    def sender_configurable?
      object.class.included_modules.include?(SenderConfigurable)
    end

    def content_configurable?
      object.class.included_modules.include?(ContentConfigurable)
    end

    def trackable?
      object.class.included_modules.include?(Trackable)
    end

    def recipient_configurable?
      object.class.included_modules.include?(RecipientConfigurable)
    end
  end
end

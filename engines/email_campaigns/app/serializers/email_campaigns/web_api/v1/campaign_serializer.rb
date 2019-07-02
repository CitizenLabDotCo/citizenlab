module EmailCampaigns
  class WebApi::V1::CampaignSerializer < WebApi::V1::Fast::BaseSerializer
    attributes :created_at, :updated_at
    
    attribute :campaign_name do |object|
      object.class.campaign_name
    end

    attribute :admin_campaign_description_multiloc do |object|
      object.class.admin_campaign_description_multiloc
    end

    attribute :enabled, if: Proc.new do |object|
      disableable? object
    end
    attribute :schedule, if: Proc.new do |object|
      schedulable? object
    end

    attribute :schedule_multiloc, if: Proc.new { |object|
      schedulable? object
    } do |object|
      # Temporary fix until CL2-3052 is solved
      Tenant.settings('core','locales').each_with_object({}) do |locale, result|
        I18n.with_locale('en') do
          result[locale] = object.ic_schedule.to_s
        end
      end

      # MultilocService.new.block_to_multiloc do |locale|
      #   object.ic_schedule.to_s
      # end
    end

    attribute :sender, if: Proc.new do |object|
      sender_configurable? object
    end
    attribute :reply_to, if: Proc.new do |object|
      sender_configurable? object
    end
    attribute :subject_multiloc, if: Proc.new do |object|
      content_configurable? object
    end
    attribute :body_multiloc, if: Proc.new do |object|
      content_configurable? object
    end
    attribute :deliveries_count, if: Proc.new do |object|
      trackable? object
    end

    belongs_to :author, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer

    has_many :groups, if: Proc.new do |object|
      recipient_configurable? object
    end

    def disableable? object
      object.class.included_modules.include?(Disableable)
    end

    def schedulable? object
      object.class.included_modules.include?(Schedulable)
    end

    def sender_configurable? object
      object.class.included_modules.include?(SenderConfigurable)
    end

    def content_configurable? object
      object.class.included_modules.include?(ContentConfigurable)
    end

    def trackable? object
      object.class.included_modules.include?(Trackable)
    end

    def recipient_configurable? object
      object.class.included_modules.include?(RecipientConfigurable)
    end
  end
end

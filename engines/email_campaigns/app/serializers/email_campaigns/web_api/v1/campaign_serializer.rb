module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ::WebApi::V1::BaseSerializer
    attributes :created_at, :updated_at

    attribute :campaign_name do |object|
      object.class.campaign_name
    end

    attribute :admin_campaign_description_multiloc do |object|
      object.class.admin_campaign_description_multiloc
    end

    attribute :enabled, if: Proc.new { |object|
      disableable? object
    }
    attribute :schedule, if: Proc.new { |object|
      schedulable? object
    }

    attribute :schedule_multiloc, if: Proc.new { |object|
      schedulable? object
    } do |object|
      # Temporary fix until CL2-3052 is solved
      AppConfiguration.instance.settings('core','locales').each_with_object({}) do |locale, result|
        I18n.with_locale('en') do
          result[locale] = object.ic_schedule.to_s
        end
      end

      # MultilocService.new.block_to_multiloc do |locale|
      #   object.ic_schedule.to_s
      # end
    end

    attribute :sender, if: Proc.new { |object|
      sender_configurable? object
    }
    attribute :reply_to, if: Proc.new { |object|
      sender_configurable? object
    }
    attribute :subject_multiloc, if: Proc.new { |object|
      content_configurable? object
    }
    attribute :body_multiloc, if: Proc.new { |object|
      content_configurable? object
    } do |object|
      TextImageService.new.render_data_images object, :body_multiloc
    end
    attribute :deliveries_count, if: Proc.new { |object|
      trackable? object
    }

    belongs_to :author, record_type: :user, serializer: ::WebApi::V1::UserSerializer

    has_many :groups, if: Proc.new { |object|
      recipient_configurable? object
    }

    def self.disableable? object
      object.class.included_modules.include?(Disableable)
    end

    def self.schedulable? object
      object.class.included_modules.include?(Schedulable)
    end

    def self.sender_configurable? object
      object.class.included_modules.include?(SenderConfigurable)
    end

    def self.content_configurable? object
      object.class.included_modules.include?(ContentConfigurable)
    end

    def self.trackable? object
      object.class.included_modules.include?(Trackable)
    end

    def self.recipient_configurable? object
      object.class.included_modules.include?(RecipientConfigurable)
    end
  end
end

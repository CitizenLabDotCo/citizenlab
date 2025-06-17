# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::CampaignSerializer < ::WebApi::V1::BaseSerializer
    extend GroupOrderingHelper
    attributes :created_at, :updated_at, :context_id

    attribute :campaign_name do |object|
      object.class.campaign_name
    end

    attribute :campaign_description_multiloc do |object|
      object.class.campaign_description_multiloc
    end

    attribute :recipient_role_multiloc do |object|
      if object.class.recipient_role_multiloc_key.present?
        @multiloc_service ||= MultilocService.new
        @multiloc_service.i18n_to_multiloc(object.class.recipient_role_multiloc_key)
      end
    end

    attribute :recipient_segment_multiloc do |object|
      if object.class.recipient_segment_multiloc_key.present?
        @multiloc_service ||= MultilocService.new
        @multiloc_service.i18n_to_multiloc(object.class.recipient_segment_multiloc_key)
      end
    end

    attribute :content_type_multiloc do |object|
      if object.class.content_type_multiloc_key.present?
        @multiloc_service ||= MultilocService.new
        @multiloc_service.i18n_to_multiloc(object.class.content_type_multiloc_key)
      end
    end

    attribute :trigger_multiloc do |object|
      if object.class.trigger_multiloc_key.present?
        @multiloc_service ||= MultilocService.new
        @multiloc_service.i18n_to_multiloc(object.class.trigger_multiloc_key)
      end
    end

    attribute :recipient_role_ordering do |object|
      if object.class.recipient_role_multiloc_key.present?
        group_ordering('recipient_role', object.class.recipient_role_multiloc_key&.split('.')&.last)
      end
    end

    attribute :content_type_ordering do |object|
      if object.class.content_type_multiloc_key.present?
        group_ordering('content_type', object.class.content_type_multiloc_key&.split('.')&.last)
      end
    end

    attribute :enabled, if: proc { |object|
      disableable? object
    }
    attribute :schedule, if: proc { |object|
      schedulable? object
    }

    attribute :schedule_multiloc, if: proc { |object|
      schedulable? object
    } do |object|
      AppConfiguration.instance.settings('core', 'locales').each_with_object({}) do |locale, result|
        I18n.with_locale(locale) do
          result[locale] = object.schedule_multiloc_value
        end
      end
    end

    attribute :delivery_stats, if: proc { |object|
      object.manual? && object.sent?
    } do |object|
      Delivery.status_counts(object.id)
    end

    attribute :sender, if: proc { |object|
      sender_configurable? object
    }
    attribute :reply_to, if: proc { |object|
      sender_configurable? object
    }
    attribute :subject_multiloc, if: proc { |object|
      content_configurable?(object)
    }
    attribute :body_multiloc, if: proc { |object|
      content_configurable? object
    } do |object|
      TextImageService.new.render_data_images_multiloc object.body_multiloc, field: :body_multiloc, imageable: object
    end
    attribute :deliveries_count, if: proc { |object|
      trackable? object
    }

    # For customisation of regions of the automated emails
    attribute :editable_regions do |object|
      object.mailer_class.editable_regions
    end
    attribute :title_multiloc, if: proc { |object|
      content_configurable?(object)
    }
    attribute :intro_multiloc, if: proc { |object|
      content_configurable? object
    } do |object|
      TextImageService.new.render_data_images_multiloc object.intro_multiloc, field: :intro_multiloc, imageable: object
    end
    attribute :button_text_multiloc, if: proc { |object|
      content_configurable?(object)
    }

    belongs_to :author, record_type: :user, serializer: ::WebApi::V1::UserSerializer

    has_many :groups, serializer: ::WebApi::V1::GroupSerializer, if: proc { |object|
      recipient_configurable? object
    }

    def self.disableable?(object)
      object.class.included_modules.include?(Disableable)
    end

    def self.schedulable?(object)
      object.class.included_modules.include?(Schedulable)
    end

    def self.sender_configurable?(object)
      object.class.included_modules.include?(SenderConfigurable)
    end

    def self.content_configurable?(object)
      object.class.included_modules.include?(ContentConfigurable)
    end

    def self.trackable?(object)
      object.class.included_modules.include?(Trackable)
    end

    def self.recipient_configurable?(object)
      object.class.included_modules.include?(RecipientConfigurable)
    end
  end
end

# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::ConsentSerializer < ::WebApi::V1::BaseSerializer
    extend GroupOrderingHelper
    attributes :consented, :created_at, :updated_at

    attribute :campaign_name do |object|
      object.campaign_type.safe_constantize&.campaign_name
    end

    attribute :campaign_type_description_multiloc do |object|
      object.campaign_type.safe_constantize&.campaign_description_multiloc
    end

    attribute :content_type_multiloc do |object|
      if object.campaign_type.safe_constantize&.content_type_multiloc_key.present?
        @multiloc_service ||= MultilocService.new
        @multiloc_service.i18n_to_multiloc(object.campaign_type.safe_constantize&.content_type_multiloc_key)
      end
    end

    attribute :content_type_ordering do |object|
      if object.campaign_type.safe_constantize&.content_type_multiloc_key.present?
        group_ordering('content_type', object.campaign_type.safe_constantize&.content_type_multiloc_key&.split('.')&.last)
      end
    end
  end
end

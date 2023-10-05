# frozen_string_literal: true

class PublicApi::V2::EmailCampaignDeliverySerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :email_campaign_id,
    :user_id,
    :delivery_status,
    :sent_at,
    :created_at,
    :updated_at

  def email_campaign_id
    object.campaign_id
  end
end

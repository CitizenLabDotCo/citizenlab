# frozen_string_literal: true

class PublicApi::V2::EmailCampaignSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :sender,
    :reply_to,
    :subject,
    :body,
    :created_at,
    :updated_at,
    :deliveries_count

  def subject
    multiloc_service.t(object.subject_multiloc)
  end

  def body
    multiloc_service.t(object.body_multiloc)
  end
end

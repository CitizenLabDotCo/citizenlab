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

  multiloc_attributes(
    :subject_multiloc,
    :body_multiloc
  )
end

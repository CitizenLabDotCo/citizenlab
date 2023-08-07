# frozen_string_literal: true

class WebApi::V1::Notifications::InitiativeResubmittedForReviewSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :post_title_multiloc do |object|
    object.post&.title_multiloc
  end

  attribute :post_slug do |object|
    object.post&.slug
  end
end

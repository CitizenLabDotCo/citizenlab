# frozen_string_literal: true

class WebApi::V1::Notifications::OfficialFeedbackOnInitiativeYouFollowSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :official_feedback_author do |object|
    object.official_feedback&.author_multiloc
  end

  attribute :post_title_multiloc do |object|
    object.post&.title_multiloc
  end

  attribute :post_slug do |object|
    object.post&.slug
  end
end

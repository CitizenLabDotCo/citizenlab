# frozen_string_literal: true

class WebApi::V1::Notifications::OfficialFeedbackOnIdeaYouFollowSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :official_feedback_author do |object|
    object.official_feedback&.author_multiloc
  end

  attribute :post_title_multiloc do |object|
    object.idea&.title_multiloc
  end

  attribute :post_slug do |object|
    object.idea&.slug
  end
end

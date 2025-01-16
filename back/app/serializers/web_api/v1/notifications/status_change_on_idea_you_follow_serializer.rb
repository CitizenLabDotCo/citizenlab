# frozen_string_literal: true

class WebApi::V1::Notifications::StatusChangeOnIdeaYouFollowSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :post_title_multiloc do |object|
    object.idea&.title_multiloc
  end

  attribute :post_slug do |object|
    object.idea&.slug
  end

  attribute :idea_status_title_multiloc do |object|
    object.idea_status&.title_multiloc
  end
end

# frozen_string_literal: true

class WebApi::V1::Notifications::CommentDeletedByAdminSerializer < WebApi::V1::Notifications::NotificationSerializer
  attributes :reason_code, :other_reason

  attribute :post_title_multiloc do |object|
    object.idea&.title_multiloc
  end
end

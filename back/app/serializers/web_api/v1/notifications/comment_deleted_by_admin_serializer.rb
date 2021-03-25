class WebApi::V1::Notifications::CommentDeletedByAdminSerializer < WebApi::V1::Notifications::NotificationSerializer
  attributes :reason_code, :other_reason, :post_type

  attribute :post_title_multiloc do |object|
    object.post&.title_multiloc
  end
end

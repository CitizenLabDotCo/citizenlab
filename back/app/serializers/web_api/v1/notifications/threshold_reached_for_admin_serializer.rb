class WebApi::V1::Notifications::ThresholdReachedForAdminSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :post_title_multiloc do |object|
    object.post&.title_multiloc
  end

  attribute :post_slug do |object|
    object.post&.slug
  end
end

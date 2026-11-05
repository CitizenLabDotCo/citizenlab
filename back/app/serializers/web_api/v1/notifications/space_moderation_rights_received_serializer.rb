class WebApi::V1::Notifications::SpaceModerationRightsReceivedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :space_id

  attribute :space_title_multiloc do |object|
    object.space&.title_multiloc
  end
end

class WebApi::V1::Notifications::ProjectModerationRightsReceivedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_id

  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end
end

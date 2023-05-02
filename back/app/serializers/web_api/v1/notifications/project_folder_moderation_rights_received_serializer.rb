# frozen_string_literal: true

class WebApi::V1::Notifications::ProjectFolderModerationRightsReceivedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_folder_id

  attribute :project_folder_title_multiloc do |object|
    object.project_folder&.title_multiloc
  end
end

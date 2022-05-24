# frozen_string_literal: true

FactoryBot.define do
  factory :project_folder_moderation_rights_received, parent: :notification, class: 'ProjectFolders::Notifications::ProjectFolderModerationRightsReceived' do
    initiating_user
    project_folder
  end
end

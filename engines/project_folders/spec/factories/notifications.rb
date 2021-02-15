
FactoryBot.define do
  factory :project_folder_moderation_rights_received, parent: :notification, class: 'Notifications::ProjectFolderModerationRightsReceived' do
    initiating_user
    project_folder
  end
end

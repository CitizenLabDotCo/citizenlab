class ChangeTypeOfIdeaAssignedToYouNotifications < ActiveRecord::Migration[6.0]
  def up
    Notification.where(type: 'Notifications::IdeaAssignedToYou')
                .update_all(type: 'IdeaAssignment::Notifications::IdeaAssignedToYou')
  end
end

class ChangeTypeOfIdeaAssignedToYouNotifications < ActiveRecord::Migration[6.0]
  def up
    Notification.disable_inheritance do
      Notification.where(type: 'Notifications::IdeaAssignedToYou')
                  .update_all(type: 'IdeaAssignment::Notifications::IdeaAssignedToYou')
    end
  end
end

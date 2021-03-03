module Notifications
  class ProjectModerationRightsReceived < Notification

    validates :project, presence: true

    ACTIVITY_TRIGGERS = {'User' => {'project_moderation_rights_given' => true}}
    EVENT_NAME = 'Project moderation rights received'


    def self.make_notifications_on activity
      recipient_id = activity.item_id
      initiator_id = activity.user_id
      project_id = activity.payload['project_id']

      if project_id && recipient_id
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           project_id: project_id
         )]
      else
        []
      end
    end
  end
end

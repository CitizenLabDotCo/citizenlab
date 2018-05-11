module Notifications
  class ProjectModerationRightsReceived < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :project

    validates :project_id, presence: true
    validates :initiating_user, presence: true

    ACTIVITY_TRIGGERS = {'User' => {'project_moderation_rights_given' => true}}
    EVENT_NAME = 'Project moderation rights received'


    def self.make_notifications_on activity
      moderator = activity.item
      recipient_id = moderator.id
      initiator_id = activity.user_id
      project_id = activity.payload[:project_id]

      if project_id && recipient_id && initiator_id && (recipient_id != initiator_id)
        [self.create(
           recipient_id: moderator.id,
           initiating_user: User.find(initiator_id),
           project_id: project_id
         )]
      else
        []
      end
    end

  end
end
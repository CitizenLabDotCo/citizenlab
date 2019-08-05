module Notifications
  class NewIdeaForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :idea
    belongs_to :project, optional: true

    validates :initiating_user, :idea, presence: true

    ACTIVITY_TRIGGERS = {'Idea' => {'published' => true}}
    EVENT_NAME = 'New idea for admin'


    def self.make_notifications_on activity
      idea = activity.item
      initiator = idea.author
      
      if initiator && !(initiator&.admin? || initiator.project_moderator?(idea.project_id))
        User.admin.or(User.project_moderator(idea.project_id)).select do |recipient|
          recipient&.id != idea&.assignee_id
        end.map do |recipient|
          self.create(
           recipient_id: recipient.id,
           initiating_user: initiator,
           idea_id: idea.id,
           project_id: idea.project_id
         )
        end
      else
        []
      end
    end

  end
end
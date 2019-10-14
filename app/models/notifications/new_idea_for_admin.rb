module Notifications
  class NewIdeaForAdmin < Notification

    validates :initiating_user, :post, presence: true

    ACTIVITY_TRIGGERS = {'Idea' => {'published' => true}}
    EVENT_NAME = 'New idea for admin'


    def self.make_notifications_on activity
      idea = activity.item
      initiator = idea.author
      
      if !(initiator&.admin? || initiator&.project_moderator?(idea.project_id))
        User.admin.or(User.project_moderator(idea.project_id)).ids.select do |recipient_id|
          recipient_id != idea&.assignee_id
        end.map do |recipient_id|
          self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator.id,
           post: idea,
           project_id: idea.project_id
         )
        end
      else
        []
      end
    end

  end
end
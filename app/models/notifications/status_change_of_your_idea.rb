module Notifications
  class StatusChangeOfYourIdea < Notification

    validates :post_status, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change of your idea'
    

    def self.make_notifications_on activity
      idea = activity.item
      recipient_id = idea&.author_id

      if idea && recipient_id
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: activity.user_id,
           post: idea,
           project_id: idea.project_id,
           post_status: idea.idea_status
         )]
      else
        []
      end
    end

  end
end


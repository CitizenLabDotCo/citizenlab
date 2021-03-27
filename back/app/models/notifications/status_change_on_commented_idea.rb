module Notifications
  class StatusChangeOnCommentedIdea < Notification

    validates :post_status, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on commented idea'
    

    def self.make_notifications_on activity
      idea = activity.item

      if idea.present?
        User.joins(:comments).where(comments: {post: idea}).distinct.ids.map do |recipient_id|
          if recipient_id != idea.author_id
            self.new(
              recipient_id: recipient_id,
              initiating_user_id: activity.user_id,
              post: idea,
              project_id: idea.project_id,
              post_status: idea.idea_status
            )
          end
        end
      else
        []
      end.compact
    end

  end
end


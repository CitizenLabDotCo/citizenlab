module Notifications
  class StatusChangeOnCommentedIdea < Notification
    
    belongs_to :idea_status
    belongs_to :post, polymorphic: true
    belongs_to :project
    belongs_to :initiating_user, class_name: 'User', optional: true

    validates :idea_status, :post, :project, presence: true


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
              idea_status_id: idea.idea_status_id
            )
          end
        end
      else
        []
      end.compact
    end

  end
end


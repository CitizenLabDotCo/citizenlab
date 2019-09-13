module Notifications
  class StatusChangeOnVotedIdea < Notification

    validates :post_status, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on voted idea'


    def self.make_notifications_on activity
      idea = activity.item

      if idea.present?
        comment_author_ids = User.joins(:comments).where(comments: {post: idea}).distinct.ids
        User.joins(:votes).where(votes: {votable: idea}).distinct.ids.map do |recipient_id|
          if !(comment_author_ids + [idea.author_id]).include?(recipient_id)
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


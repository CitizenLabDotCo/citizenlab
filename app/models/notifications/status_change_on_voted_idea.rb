module Notifications
  class StatusChangeOnVotedIdea < Notification
    
    belongs_to :idea
    belongs_to :project, optional: true
    belongs_to :idea_status, optional: true

    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on voted idea'


    def self.make_notifications_on activity
      idea = activity.item
      initiator_id = activity.user_id

      if idea.present?
        comment_author_ids = User.joins(:comments).where(comments: {post: idea}).distinct.ids
        User.joins(:votes).where(votes: {votable_id: idea.id, votable_type: 'Idea'}).distinct.ids.map do |recipient_id|
          if (recipient_id != initiator_id) && !(comment_author_ids + [idea.author_id]).include?(recipient_id)
            self.new(
              recipient_id: recipient_id,
              initiating_user_id: initiator_id,
              idea_id: idea.id,
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


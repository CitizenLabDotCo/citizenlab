module Notifications
  class OfficialFeedbackOnVotedInitiative < Notification

    validates :initiating_user, :official_feedback, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on voted initiative'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      initiator_id = official_feedback.user_id

      if official_feedback.post_type == 'Initiative' && initiator_id && !InitiativeStatusChange.where(official_feedback: official_feedback).exists?
        comment_author_ids = User.active
          .joins(:comments).merge(Comment.published)
          .where(comments: {post: official_feedback.post})
          .distinct
          .ids
        voter_ids = User.active
          .joins(:votes).where(votes: {votable: official_feedback.post})
          .distinct
          .ids

        (voter_ids - [initiator_id, *comment_author_ids, official_feedback.post.author_id]).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user_id: initiator_id,
            post: official_feedback.post,
            official_feedback: official_feedback
            )
        end
      else
        []
      end.compact
    end

  end
end

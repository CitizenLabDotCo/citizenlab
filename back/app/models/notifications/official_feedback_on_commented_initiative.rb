module Notifications
  class OfficialFeedbackOnCommentedInitiative < Notification

    validates :initiating_user, :official_feedback, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on commented initiative'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      initiator_id = official_feedback.user_id
      with_status_change = InitiativeStatusChange.where(official_feedback: official_feedback).exists?

      if official_feedback.post_type == 'Initiative' && initiator_id && !InitiativeStatusChange.where(official_feedback: official_feedback).exists?
        User.active
          .joins(:comments).merge(Comment.published)
          .where(comments: {post: official_feedback.post})
          .distinct
          .ids
          .select{|recipient_id| recipient_id != initiator_id && recipient_id != official_feedback.post.author_id}
          .map do |recipient_id|
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

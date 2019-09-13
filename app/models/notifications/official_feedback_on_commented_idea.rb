module Notifications
  class OfficialFeedbackOnCommentedIdea < Notification

    validates :initiating_user, :official_feedback, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on commented idea'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      initiator_id = official_feedback.user_id

      if official_feedback.post_type == 'Idea' && initiator_id
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
              official_feedback: official_feedback,
              project_id: official_feedback.post.project_id
            )
          end
      else
        []
      end.compact
    end

  end
end

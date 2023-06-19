# frozen_string_literal: true

# == Schema Information
#
# Table name: notifications
#
#  id                            :uuid             not null, primary key
#  type                          :string
#  read_at                       :datetime
#  recipient_id                  :uuid
#  post_id                       :uuid
#  comment_id                    :uuid
#  project_id                    :uuid
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  initiating_user_id            :uuid
#  spam_report_id                :uuid
#  invite_id                     :uuid
#  reason_code                   :string
#  other_reason                  :string
#  post_status_id                :uuid
#  official_feedback_id          :uuid
#  phase_id                      :uuid
#  post_type                     :string
#  post_status_type              :string
#  project_folder_id             :uuid
#  inappropriate_content_flag_id :uuid
#  internal_comment_id           :uuid
#
# Indexes
#
#  index_notifications_on_created_at                           (created_at)
#  index_notifications_on_inappropriate_content_flag_id        (inappropriate_content_flag_id)
#  index_notifications_on_initiating_user_id                   (initiating_user_id)
#  index_notifications_on_invite_id                            (invite_id)
#  index_notifications_on_official_feedback_id                 (official_feedback_id)
#  index_notifications_on_phase_id                             (phase_id)
#  index_notifications_on_post_id_and_post_type                (post_id,post_type)
#  index_notifications_on_post_status_id                       (post_status_id)
#  index_notifications_on_post_status_id_and_post_status_type  (post_status_id,post_status_type)
#  index_notifications_on_recipient_id                         (recipient_id)
#  index_notifications_on_recipient_id_and_read_at             (recipient_id,read_at)
#  index_notifications_on_spam_report_id                       (spam_report_id)
#
# Foreign Keys
#
#  fk_rails_...  (comment_id => comments.id)
#  fk_rails_...  (inappropriate_content_flag_id => flag_inappropriate_content_inappropriate_content_flags.id)
#  fk_rails_...  (initiating_user_id => users.id)
#  fk_rails_...  (internal_comment_id => internal_comments.id)
#  fk_rails_...  (invite_id => invites.id)
#  fk_rails_...  (official_feedback_id => official_feedbacks.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (recipient_id => users.id)
#  fk_rails_...  (spam_report_id => spam_reports.id)
#
module Notifications
  class InternalCommentOnInitiativeAssignedToYou < Notification
    validates :initiating_user, :internal_comment, presence: true

    ACTIVITY_TRIGGERS = { 'InternalComment' => { 'created' => true } }
    EVENT_NAME = 'Internal comment on initiative assigned to you'

    def self.make_notifications_on(activity)
      internal_comment = activity.item
      recipient_id = internal_comment&.post&.assignee_id
      initiator_id = internal_comment.author_id
      parent_author_id = internal_comment&.parent&.author_id
      post_type = internal_comment.post_type

      if post_type == 'Initiative' &&
         recipient_id &&
         initiator_id &&
         (recipient_id != initiator_id) &&
         (recipient_id != parent_author_id) && # user should receive a different notification for comment on their comment
         !recipient_mentioned?(internal_comment) # user should receive a different notification if they are mentioned

        attributes = {
          recipient_id: recipient_id,
          initiating_user_id: initiator_id,
          internal_comment: internal_comment,
          post_id: internal_comment.post_id,
          post_type: post_type
        }

        [new(attributes)]
      else
        []
      end
    end

    def self.recipient_mentioned?(internal_comment)
      MentionService.new.user_mentioned?(internal_comment.body, internal_comment.post.assignee)
    end

    private_class_method :recipient_mentioned?
  end
end

# frozen_string_literal: true

# == Schema Information
#
# Table name: notifications
#
#  id                            :uuid             not null, primary key
#  type                          :string
#  read_at                       :datetime
#  recipient_id                  :uuid
#  idea_id                       :uuid
#  comment_id                    :uuid
#  project_id                    :uuid
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  initiating_user_id            :uuid
#  spam_report_id                :uuid
#  invite_id                     :uuid
#  reason_code                   :string
#  other_reason                  :string
#  idea_status_id                :uuid
#  official_feedback_id          :uuid
#  phase_id                      :uuid
#  project_folder_id             :uuid
#  inappropriate_content_flag_id :uuid
#  internal_comment_id           :uuid
#  basket_id                     :uuid
#  cosponsors_initiative_id      :uuid
#  cosponsorship_id              :uuid
#  project_review_id             :uuid
#
# Indexes
#
#  index_notifications_on_basket_id                      (basket_id)
#  index_notifications_on_cosponsors_initiative_id       (cosponsors_initiative_id)
#  index_notifications_on_cosponsorship_id               (cosponsorship_id)
#  index_notifications_on_created_at                     (created_at)
#  index_notifications_on_idea_status_id                 (idea_status_id)
#  index_notifications_on_inappropriate_content_flag_id  (inappropriate_content_flag_id)
#  index_notifications_on_initiating_user_id             (initiating_user_id)
#  index_notifications_on_internal_comment_id            (internal_comment_id)
#  index_notifications_on_invite_id                      (invite_id)
#  index_notifications_on_official_feedback_id           (official_feedback_id)
#  index_notifications_on_phase_id                       (phase_id)
#  index_notifications_on_project_review_id              (project_review_id)
#  index_notifications_on_recipient_id                   (recipient_id)
#  index_notifications_on_recipient_id_and_read_at       (recipient_id,read_at)
#  index_notifications_on_spam_report_id                 (spam_report_id)
#
# Foreign Keys
#
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (comment_id => comments.id)
#  fk_rails_...  (cosponsors_initiative_id => cosponsors_initiatives.id)
#  fk_rails_...  (cosponsorship_id => cosponsorships.id)
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (idea_status_id => idea_statuses.id)
#  fk_rails_...  (inappropriate_content_flag_id => flag_inappropriate_content_inappropriate_content_flags.id)
#  fk_rails_...  (initiating_user_id => users.id)
#  fk_rails_...  (internal_comment_id => internal_comments.id)
#  fk_rails_...  (invite_id => invites.id)
#  fk_rails_...  (official_feedback_id => official_feedbacks.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (project_review_id => project_reviews.id)
#  fk_rails_...  (recipient_id => users.id)
#  fk_rails_...  (spam_report_id => spam_reports.id)
#
module Notifications
  class OfficialFeedbackOnIdeaYouFollow < Notification
    validates :initiating_user, :official_feedback, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }

    ACTIVITY_TRIGGERS = { 'OfficialFeedback' => { 'created' => true } }
    EVENT_NAME = 'Official feedback on idea you follow'

    def self.make_notifications_on(activity)
      return [] unless AppConfiguration.instance.feature_activated? 'follow'

      official_feedback = activity.item
      initiator_id = official_feedback.user_id

      if initiator_id
        User.from_follows(official_feedback.idea.followers).where.not(id: initiator_id).map do |recipient|
          new(
            recipient_id: recipient.id,
            initiating_user_id: initiator_id,
            post: official_feedback.idea,
            official_feedback: official_feedback,
            project_id: official_feedback.idea.project_id
          )
        end
      else
        []
      end
    end
  end
end

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
#  cosponsorship_id              :uuid
#  project_review_id             :uuid
#  space_id                      :uuid
#
# Indexes
#
#  index_notifications_on_basket_id                      (basket_id)
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
#  index_notifications_on_space_id                       (space_id)
#  index_notifications_on_spam_report_id                 (spam_report_id)
#
# Foreign Keys
#
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (comment_id => comments.id)
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
#  fk_rails_...  (space_id => spaces.id)
#  fk_rails_...  (spam_report_id => spam_reports.id)
#
module Notifications
  class MarkedAsSpam < Notification
    validates :initiating_user, presence: true
    validates :spam_report, presence: true

    ACTIVITY_TRIGGERS = { 'SpamReport' => { 'created' => true } }.freeze

    def self.recipient_ids(initiating_user_id = nil, project_id = nil)
      UserRoleService.new.moderators_for(Project.find(project_id))
        .ids
        .reject { |id| id == initiating_user_id }
    end

    def self.make_notifications_on(_activity)
      []
    end

    # Moderators are told about the first report on a piece of content. Repeat
    # reports are still recorded, but they are only mailed out again when
    # something has moved since the last notification: a moderator dismissed the
    # flag and the content was reported anew, or the content itself was edited.
    # Without this, every report on the same content notifies every moderator of
    # the project again.
    def self.notify?(flaggable, last_notified_at)
      return true if last_notified_at.blank?

      flag_reopened_since?(flaggable, last_notified_at) || edited_since?(flaggable, last_notified_at)
    end

    # `InappropriateContentFlagService#introduce_flag!` clears `deleted_at` and
    # saves when a report re-opens a dismissed flag, so a live flag touched after
    # the last notification was re-opened by this report. We read the flag record
    # rather than its activity: the record is written synchronously in
    # `SideFxSpamReportService#after_create`, while the activity is logged by a
    # job that races the one building this notification.
    def self.flag_reopened_since?(flaggable, time)
      flag = flaggable.try(:inappropriate_content_flag)
      flag.present? && flag.deleted_at.nil? && flag.updated_at > time
    end
    private_class_method :flag_reopened_since?

    # `updated_at` on the flaggable is no use here: reaction and comment counters
    # touch it, so a single like would let the next report through.
    def self.edited_since?(flaggable, time)
      Activity.where(item: flaggable, action: 'changed').exists?(['acted_at > ?', time])
    end
    private_class_method :edited_since?
  end
end

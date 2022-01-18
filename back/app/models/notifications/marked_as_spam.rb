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
#  fk_rails_...  (invite_id => invites.id)
#  fk_rails_...  (official_feedback_id => official_feedbacks.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (recipient_id => users.id)
#  fk_rails_...  (spam_report_id => spam_reports.id)
#
module Notifications
  class MarkedAsSpam < Notification
    validates :initiating_user, presence: true
    validates :spam_report, presence: true

    ACTIVITY_TRIGGERS = { 'SpamReport' => { 'created' => true } }.freeze

    def self.recipient_ids(initiating_user_id = nil, project_id = nil)
      admin_ids = User.admin.ids
      admin_ids.delete(initiating_user_id) if initiating_user_id
      admin_ids
    end

    def self.make_notifications_on(_activity)
      []
    end
  end
end

Notifications::MarkedAsSpam.prepend_if_ee('ProjectManagement::Patches::Notifications::MarkedAsSpam')

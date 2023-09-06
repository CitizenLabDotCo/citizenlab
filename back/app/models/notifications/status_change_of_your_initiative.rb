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
#  basket_id                     :uuid
#  cosponsors_initiative_id      :uuid
#  event_id                      :uuid
#
# Indexes
#
#  index_notifications_on_basket_id                            (basket_id)
#  index_notifications_on_cosponsors_initiative_id             (cosponsors_initiative_id)
#  index_notifications_on_created_at                           (created_at)
#  index_notifications_on_event_id                             (event_id)
#  index_notifications_on_inappropriate_content_flag_id        (inappropriate_content_flag_id)
#  index_notifications_on_initiating_user_id                   (initiating_user_id)
#  index_notifications_on_internal_comment_id                  (internal_comment_id)
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
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (comment_id => comments.id)
#  fk_rails_...  (cosponsors_initiative_id => cosponsors_initiatives.id)
#  fk_rails_...  (event_id => events.id)
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
  class StatusChangeOfYourInitiative < Notification
    validates :post_status, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }

    ACTIVITY_TRIGGERS = { 'Initiative' => { 'changed_status' => true } }
    EVENT_NAME = 'Status change of your initiative'

    def self.make_notifications_on(activity)
      initiative = activity.item
      cosponsor_ids = initiative.cosponsors_initiatives.where(status: 'accepted').pluck(:user_id)
      recipient_ids = [initiative&.author_id] + cosponsor_ids

      if initiative && recipient_ids
        recipient_ids.map do |recipient_id|
          new(
            recipient_id: recipient_id,
            initiating_user_id: activity.user_id,
            post: initiative,
            post_status: initiative.initiative_status
          )
        end
      else
        []
      end
    end
  end
end

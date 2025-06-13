# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  custom_text_multiloc :jsonb
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  # Currently, the only supported state change is from 'pending' to 'approved'.
  class Campaigns::ProjectReviewStateChange < Campaign
    include ActivityTriggerable
    include Trackable

    recipient_filter :notification_recipient

    def mailer_class
      ProjectReviewStateChangeMailer
    end

    def activity_triggers
      { 'Notifications::ProjectReviewStateChange' => { 'created' => true } }
    end

    def notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient_id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.project_review_requester'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.project_review_state_change'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.projects'
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      [{ event_payload: { project_review_id: notification.project_review_id } }]
    end
  end
end

# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#  context_id       :uuid
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
  class Campaigns::ProjectReviewRequest < Campaign
    include ActivityTriggerable
    include Trackable

    recipient_filter :notification_recipient

    def mailer_class
      ProjectReviewRequestMailer
    end

    def activity_triggers
      { 'Notifications::ProjectReviewRequest' => { 'created' => true } }
    end

    def notification_recipient(users_scope, activity:, time: nil)
      # This is a bit convoluted, but that's because we only want to send the email to
      # superadmins if they’re explicitly set as project reviewers. In other words, when
      # the request is being broadcast to all admins because project reviewers haven’t
      # been configured, we don’t want to include the superadmins.
      recipient_scope = users_scope.where(id: activity.item.recipient_id)
      recipient_scope.not_citizenlab_member.or(recipient_scope.citizenlab_member.project_reviewers)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.project_reviewers'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.project_review_request'
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

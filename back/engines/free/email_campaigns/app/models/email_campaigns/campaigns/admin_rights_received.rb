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
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id  (author_id)
#  index_email_campaigns_campaigns_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::AdminRightsReceived < Campaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages except: %w[trial churned]

    recipient_filter :filter_notification_recipient

    def mailer_class
      AdminRightsReceivedMailer
    end

    def activity_triggers
      { 'Notifications::AdminRightsReceived' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands(recipient:, activity:, time: nil)
      [
        { event_payload: {} }
      ]
    end
  end
end

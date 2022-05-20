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
  class Campaigns::Welcome < Campaign
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages except: ['churned']

    recipient_filter :filter_recipient

    def mailer_class
      WelcomeMailer
    end

    def activity_triggers
      { 'User' => { 'completed_registration' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.id)
    end

    def generate_commands(_options = {})
      # All required information is acquired from the
      # identified user so no payload is required.
      [{
        event_payload: {}
      }]
    end
  end
end

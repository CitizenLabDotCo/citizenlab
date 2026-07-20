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
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#  context_type         :string
#  channel              :string           default("email"), not null
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
  class Campaigns::UserBlocked < Campaign
    include ActivityTriggerable
    include Trackable
    include ContentConfigurable

    # Mandatory transactional email: deliberately not Disableable or Consentable.
    # Triggered by the 'blocked' activity logged in SideFxUserService#after_block.
    # The block reason and end date are read from the recipient in the template.

    recipient_filter :filter_recipient

    def mailer_class
      UserBlockedMailer
    end

    def activity_triggers
      { 'User' => { 'blocked' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item_id)
    end

    def generate_commands(recipient:, activity:, time: nil)
      [{
        event_payload: {}
      }]
    end

    def can_be_disabled?
      false
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_is_blocked'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_is_blocked'
    end
  end
end

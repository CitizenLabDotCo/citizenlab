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
  class Campaigns::InviteReminder < Campaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages except: %w[trial churned]

    before_send :check_send_invite_email_toggle
    recipient_filter :filter_recipient

    def mailer_class
      InviteReminderMailer
    end

    def activity_triggers
      { 'Invite' => { 'not_accepted_since_3_days' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.invitee.id)
    end

    def generate_commands(recipient:, activity:)
      [{
        event_payload: {
          inviter_first_name: activity.item.inviter.first_name,
          inviter_last_name: activity.item.inviter.last_name,
          invitee_first_name: activity.item.invitee.first_name,
          invitee_last_name: activity.item.invitee.last_name,
          invite_text: activity.item.invite_text,
          activate_invite_url: Frontend::UrlService.new.invite_url(activity.item.token, locale: activity.item.invitee.locale)
        }
      }]
    end

    def check_send_invite_email_toggle(activity:, time: nil)
      !!activity.item&.send_invite_email
    end
  end
end

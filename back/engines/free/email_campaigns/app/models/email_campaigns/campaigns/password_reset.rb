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
  class Campaigns::PasswordReset < Campaign
    include Trackable
    include ActivityTriggerable

    recipient_filter :filter_recipient

    def activity_triggers
      {'User' => {'requested_password_reset' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.id)
    end

    def mailer_class
      PasswordResetMailer
    end

    def generate_commands recipient:, activity: 
      [{
        event_payload: {
          password_reset_url: Frontend::UrlService.new.reset_password_url(activity.payload['token'], locale: recipient.locale)
        }
      }]
    end
  end
end

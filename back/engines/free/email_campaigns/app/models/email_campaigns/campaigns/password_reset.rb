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
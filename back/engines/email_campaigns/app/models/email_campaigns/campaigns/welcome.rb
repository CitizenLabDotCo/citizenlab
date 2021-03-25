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
      {'User' => {'completed_registration' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.id)
    end

    def generate_commands options={}
      # All required information is acquired from the
      # identified user so no payload is required.
      [{
        event_payload: {}
      }]
    end
  end
end
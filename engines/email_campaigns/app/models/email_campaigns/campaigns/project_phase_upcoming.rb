module EmailCampaigns
  class Campaigns::ProjectPhaseUpcoming < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::ProjectPhaseUpcoming' => {'created' => true}}
    end

    def generate_commands recipient:, activity:
      commands = super
      commands.map do |command|
        command[:delay] = 8.hours.to_i
        command
      end
    end
  end
end
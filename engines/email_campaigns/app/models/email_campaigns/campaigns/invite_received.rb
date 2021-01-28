module EmailCampaigns
  class Campaigns::InviteReceived < Campaign
    include ActivityTriggerable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages except: ['churned']

    before_send :check_send_invite_email_toggle
    recipient_filter :filter_recipient


    def mailer_class
      InviteReceivedMailer
    end

    def activity_triggers
      {'Invite' => {'created' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      if activity.item&.invitee_id
        users_scope.where(id: activity.item.invitee_id)
      else
        users_scope.none
      end
    end

    def generate_commands recipient:, activity:
      [{
        event_payload: {
          inviter_first_name: activity.item.inviter&.first_name,
          inviter_last_name: activity.item.inviter&.last_name,
          invitee_first_name: activity.item.invitee.first_name,
          invitee_last_name: activity.item.invitee.last_name,
          invite_text: activity.item.invite_text,
          activate_invite_url: Frontend::UrlService.new.invite_url(activity.item.token, locale: activity.item.invitee.locale)
        }
      }]
    end

    def check_send_invite_email_toggle activity:, time: nil
      !!activity.item&.send_invite_email
    end
  end
end
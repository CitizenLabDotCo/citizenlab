module EmailCampaigns
  class InviteReceivedMailerPreview < ActionMailer::Preview
    def campaign_mail
      invitee = User.first
      inviter = User.last
      token = InvitesService.new.generate_token
      command = {
        recipient: invitee,
        event_payload: {
          inviter_first_name: inviter.first_name,
          inviter_last_name: inviter.last_name,
          invitee_first_name: invitee.first_name,
          invitee_last_name: invitee.last_name,
          invite_text: '<p>Would you like to join our awesome platform?</p>',
          activate_invite_url: Frontend::UrlService.new.invite_url(token, locale: invitee.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::InviteReceived.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

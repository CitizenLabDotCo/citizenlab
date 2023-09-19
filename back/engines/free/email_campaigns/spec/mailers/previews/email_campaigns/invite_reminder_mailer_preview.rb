# frozen_string_literal: true

module EmailCampaigns
  class InviteReminderMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      inviter = User.last
      token = Invites::Service.new.generate_token
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          inviter_first_name: inviter.first_name,
          inviter_last_name: inviter.last_name,
          invitee_first_name: recipient_user.first_name,
          invitee_last_name: recipient_user.last_name,
          invite_text: '<p>Would you like to join our awesome platform?</p>',
          invite_created_at: 50.hours.ago,
          activate_invite_url: Frontend::UrlService.new.invite_url(token, locale: recipient_user.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::InviteReminder.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

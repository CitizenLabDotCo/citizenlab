module EmailCampaigns
  class PasswordResetMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first
      token = ResetPasswordService.new.generate_reset_password_token recipient
      command = {
        recipient: recipient,
        event_payload: {
          password_reset_url: Frontend::UrlService.new.reset_password_url(token, locale: recipient.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::PasswordReset.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

# frozen_string_literal: true

module EmailCampaigns
  class InviteReminderMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InviteReminder)
    end
  end
end

# frozen_string_literal: true

module EmailCampaigns
  class InappropriateContentFlaggedPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      flaggable = Initiative.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          flaggable_type: flaggable.class.name,
          flaggable_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient_user).display_name!(flaggable.author),
          flaggable_url: Frontend::UrlService.new.model_to_url(flaggable, locale: recipient_user.locale),
          flaggable_title_multiloc: flaggable.title_multiloc,
          flaggable_body_multiloc: flaggable.body_multiloc
        }
      }
      campaign = FlagInappropriateContent::EmailCampaigns::Campaigns::InappropriateContentFlagged.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

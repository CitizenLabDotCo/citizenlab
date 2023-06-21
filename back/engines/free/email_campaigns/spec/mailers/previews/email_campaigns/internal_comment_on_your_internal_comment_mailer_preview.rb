# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnYourInternalCommentMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      command = {
        recipient: recipient_user,
        event_payload: {
          initiating_user_first_name: 'Matthias',
          initiating_user_last_name: 'Geeke',
          internal_comment_author_name: 'Matthias Geeke',
          internal_comment_body: "<span class=\"cl-mention-user\" data-user-id=\"0b36289a-d95e-4998-bb8c-866cb58e0c90\" data-user-slug=\"lieve-kuypers\">@Lieve Kuypers</span> Dat zullen de pati\u00c3\u00abnten die op hun huisbezoek of thuisverpleging graag horen. ;) Sommige gezinnen hebben nu eenmaal nood aan meerdere wagens... ",
          internal_comment_url: 'http://localhost:3000/nl-BE/ideas/afschaffen-of-versoepelen-wetgeving-rond-verharden-van-voortuin',
          post_title_multiloc: {
            'nl-BE': 'Afschaffen of versoepelen wetgeving rond verharden van voortuin'
          },
          post_type: 'Idea'
        }
      }

      campaign = EmailCampaigns::Campaigns::InternalCommentOnYourInternalComment.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

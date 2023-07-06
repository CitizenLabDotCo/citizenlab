# frozen_string_literal: true

module EmailCampaigns
  class BasketSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      # TODO: Replace data below with data from the first project
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale),
          voted_ideas: [
            {
              title_multiloc: {
                'en' => 'A voted idea title'
              },
              url: 'http://localhost:3000/en/ideas/a-voted-idea',
              images: [
                {
                  versions: {
                    small: 'http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/small_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg',
                    medium: 'http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/medium_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg',
                    large: 'http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/large_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg',
                    fb: 'http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/fb_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg'
                  }
                }
              ]
            }
          ]
        }
      }
      campaign = EmailCampaigns::Campaigns::BasketSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end

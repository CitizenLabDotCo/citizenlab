module EmailCampaigns
  class Campaigns::Manual < Campaign
    include Consentable
    include ContentConfigurable
    include SenderConfigurable
    include RecipientConfigurable
    include Trackable

    def mailer_class
      CampaignMailer
    end

    def generate_command recipient:
      {
        event_payload: {},
        subject_multiloc: subject_multiloc,
        body_multiloc: body_multiloc,
        sender: sender,
        reply_to: reply_to
      }
    end
  end
end
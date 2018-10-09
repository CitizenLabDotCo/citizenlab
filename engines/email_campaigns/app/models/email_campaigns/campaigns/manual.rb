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

    # If this would be missing, the campaign would be sent on every event and
    # every schedule trigger
    before_send :only_manual_send

    def generate_commands recipient:, time: nil, activity: nil
      [{
        author: author,
        event_payload: {},
        subject_multiloc: subject_multiloc,
        body_multiloc: body_multiloc,
        sender: sender,
        reply_to: reply_to
      }]
    end

    def only_manual_send activity: nil, time: nil
      !activity && !time
    end
  end
end
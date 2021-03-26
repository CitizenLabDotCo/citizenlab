module EmailCampaigns
  class Campaigns::Manual < Campaign
    include Consentable
    include ContentConfigurable
    include SenderConfigurable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages except: ['trial','churned']

    recipient_filter :user_filter_no_invitees

    def mailer_class
      ManualCampaignMailer
    end

    # If this would be missing, the campaign would be sent on every event and
    # every schedule trigger
    before_send :only_manual_send

    def self.category
      'official'
    end

    def generate_commands recipient:, time: nil, activity: nil
      [{
        author: author,
        event_payload: {},
        subject_multiloc: subject_multiloc,
        body_multiloc: TextImageService.new.render_data_images(self, :body_multiloc),
        sender: sender,
        reply_to: reply_to
      }]
    end

    private

    def user_filter_no_invitees users_scope, options={}
      users_scope.active
    end

    def only_manual_send activity: nil, time: nil
      !activity && !time
    end
  end
end

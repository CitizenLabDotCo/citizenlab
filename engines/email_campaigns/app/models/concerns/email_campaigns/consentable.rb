module EmailCampaigns
  module Consentable
    extend ActiveSupport::Concern

    included do
      add_recipient_filter :filter_users_with_consent
    end

    def filter_users_with_consent users_scope
      users_scope
        .joins(:email_campaigns_consents)
        .where(email_campaigns_consents: {consented: true, campaign_type: type})
    end
  end
end
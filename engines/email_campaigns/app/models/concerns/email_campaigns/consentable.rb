module EmailCampaigns
  module Consentable
    extend ActiveSupport::Concern

    included do
      has_many :consents, dependent: :destroy

      add_recipient_filter :filter_users_with_consent
    end

    def filter_users_with_consent users_scope
      users_scope
        .joins(:consents)
        .where(consents: {consented: true, campaign_type: type})
    end
  end
end
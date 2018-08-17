module EmailCampaigns
  module Consentable
    extend ActiveSupport::Concern

    included do
      recipient_filter :filter_users_with_consent
    end

    def filter_users_with_consent users_scope, options={}
      users_scope
      .where.not(id: Consent.where(campaign_type: type, consented: false).pluck(:user_id))
    end
  end
end
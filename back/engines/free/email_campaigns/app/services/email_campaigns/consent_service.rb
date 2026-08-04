# frozen_string_literal: true

module EmailCampaigns
  class ConsentService
    def record!(user, campaign_class, consented:)
      consent = Consent.find_or_initialize_by(user_id: user.id, campaign_type: campaign_class.name)
      consent.update!(consented: consented)
      consent
    end
  end
end

# frozen_string_literal: true

module EmailCampaigns
  # Records consent for a single campaign, side effects included.
  class ConsentService
    def record!(user, campaign_class, consented:)
      consent = upsert!(user, campaign_class, consented: consented)
      SideFxConsentService.new.after_update(consent, user)
      consent
    end

    # Consent given by performing an action that implies it, e.g. submitting a phone
    # number to be confirmed. Every grant is a fresh act, so it is always logged.
    def grant!(user, campaign_class)
      consent = upsert!(user, campaign_class, consented: true)
      SideFxConsentService.new.after_grant(consent, user)
      consent
    end

    private

    def upsert!(user, campaign_class, consented:)
      consent = Consent.find_or_initialize_by(user_id: user.id, campaign_type: campaign_class.name)
      consent.update!(consented: consented)
      consent
    end
  end
end

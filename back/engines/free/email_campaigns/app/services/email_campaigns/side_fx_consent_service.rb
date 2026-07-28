# frozen_string_literal: true

module EmailCampaigns
  class SideFxConsentService < BaseSideFxService
    def after_create(consent, user)
      log_consent_change(consent, user)
    end

    def after_update(consent, user)
      log_consent_change(consent, user)
    end

    # Logs a consent event unconditionally, for flows where each affirmative
    # action is itself an event we must store even when the stored `consented`
    # value is unchanged - e.g. every phone-number submission to receive an SMS
    # confirmation code (Twilio: "store evidence of each consent event").
    def log_consent_event(consent, user)
      log_activity(consent, user, Time.now.to_i)
    end

    private

    # Logs only when consent flips, so toggling to the same value is a no-op.
    def log_consent_change(consent, user)
      return unless consent.saved_change_to_consented?

      log_activity(consent, user, consent.updated_at.to_i)
    end

    def log_activity(consent, user, acted_at)
      action = consent.consented ? 'consent_given' : 'consent_withdrawn'
      LogActivityJob.perform_later(
        consent,
        action,
        user,
        acted_at,
        payload: { campaign_type: consent.campaign_type }
      )
    end

    def resource_name
      :consent
    end
  end
end

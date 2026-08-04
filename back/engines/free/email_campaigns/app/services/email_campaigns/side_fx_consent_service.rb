# frozen_string_literal: true

module EmailCampaigns
  class SideFxConsentService < BaseSideFxService
    def after_update(consent, user)
      log_consent_change(consent, user)
    end

    def record_consent(user, campaign_class, consented:, log_if_unchanged: false)
      consent = Consent.find_or_initialize_by(user_id: user.id, campaign_type: campaign_class.name)
      consent.update!(consented: consented)

      if log_if_unchanged
        log_activity(consent, user, Time.now.to_i)
      else
        log_consent_change(consent, user)
      end

      consent
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

# frozen_string_literal: true

module EmailCampaigns
  class SideFxConsentService < BaseSideFxService
    # Logs only when consent flips, so toggling to the same value is a no-op.
    def after_update(consent, user)
      return unless consent.saved_change_to_consented?

      log_activity(consent, user, consent.updated_at.to_i)
    end

    # Consent granted by performing an action that implies it (e.g. submitting a
    # phone number to be confirmed). Every grant is a fresh act, so it is logged
    # even when the stored value is unchanged.
    def after_grant(consent, user)
      log_activity(consent, user, Time.now.to_i)
    end

    private

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

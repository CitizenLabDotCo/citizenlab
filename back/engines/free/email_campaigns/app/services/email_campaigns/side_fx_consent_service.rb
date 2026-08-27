# frozen_string_literal: true

module EmailCampaigns
  class SideFxConsentService < BaseSideFxService
    # Logs only when consent flips. always_log is for consent implied by an action, where each submission is a fresh act.
    def after_update(consent, user, always_log: false)
      changed = consent.saved_change_to_consented?
      return unless always_log || changed

      action = consent.consented ? 'consent_given' : 'consent_withdrawn'
      # updated_at is stale when the value did not change, so it would misdate the activity.
      acted_at = changed ? consent.updated_at.to_i : Time.now.to_i
      LogActivityJob.perform_later(
        consent,
        action,
        user,
        acted_at,
        payload: { campaign_type: consent.campaign_type }
      )
    end

    private

    def resource_name
      :consent
    end
  end
end

# frozen_string_literal: true

module EmailCampaigns
  class SideFxCampaignService < BaseSideFxService
    include SideFxHelper

    def before_create(campaign, user); end

    def before_update(campaign, user); end

    def after_update(campaign, _user)
      # We currently only have one campaign that can be enabled/disabled at phase level,
      # and we align the respective phase-level values with the campaign enabled when the campaign value is updated.
      return unless campaign.saved_change_to_enabled? &&
                    campaign.instance_of?(EmailCampaigns::Campaigns::ProjectPhaseStarted)

      toggle_project_phase_started(campaign)
    end

    def before_send(campaign, user); end

    def after_send(campaign, user)
      LogActivityJob.perform_later(campaign, 'sent', user, campaign.updated_at.to_i)
    end

    def before_destroy(campaign, user); end

    private

    def resource_name
      :campaign
    end

    def toggle_project_phase_started(campaign)
      Phase.update_all(
        "campaigns_settings = jsonb_set(campaigns_settings, array['project_phase_started']," \
        "to_jsonb(#{campaign.enabled}));"
      )
    end
  end
end

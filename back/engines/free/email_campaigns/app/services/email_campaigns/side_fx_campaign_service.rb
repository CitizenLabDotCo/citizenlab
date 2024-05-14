# frozen_string_literal: true

module EmailCampaigns
  class SideFxCampaignService < BaseSideFxService
    include SideFxHelper

    def before_create(campaign, user); end

    def before_update(campaign, user); end

    def after_update(campaign, _user)
      # This is a special case for the project_phase_started campaign, the only
      # campaign that's currently configurable on a phase level.
      # We turn off all phase email toggles for this campaign when the platform-wide
      # setting is turned off.
      # attribute_before_last_save:
      # https://apidock.com/rails/v6.0.0/ActiveRecord/AttributeMethods/Dirty/attribute_before_last_save
      if campaign.enabled_before_last_save &&
         !campaign.enabled &&
         campaign.instance_of?(EmailCampaigns::Campaigns::ProjectPhaseStarted)
        toggle_project_phase_started(campaign)
      end
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

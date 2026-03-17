# frozen_string_literal: true

module EmailCampaigns
  class SideFxCampaignService < BaseSideFxService
    include SideFxHelper

    def before_create(campaign, user); end

    def after_update(campaign, user)
      super

      %i[enabled reply_to body_multiloc subject_multiloc title_multiloc intro_multiloc button_text_multiloc schedule].each do |attr|
        next if !campaign.public_send(:"saved_change_to_#{attr}?")

        LogActivityJob.perform_later(
          campaign,
          "changed_#{attr}",
          user,
          campaign.updated_at.to_i,
          payload: { change: campaign.saved_changes[attr] }
        )
      end

      enqueue_scheduled_send(campaign)
    end

    def before_send(campaign, user); end

    def after_send(campaign, user)
      LogActivityJob.perform_later(campaign, 'sent', user, campaign.updated_at.to_i)
    end

    def before_destroy(campaign, user); end

    private

    def enqueue_scheduled_send(campaign)
      return unless campaign.manual? && campaign.saved_change_to_schedule?

      scheduled_at = campaign.scheduled_at
      return unless scheduled_at.present? && scheduled_at > Time.zone.now

      SendScheduledCampaignJob.set(wait_until: scheduled_at).perform_later(campaign.id, scheduled_at)
    end

    def resource_name
      :campaign
    end
  end
end

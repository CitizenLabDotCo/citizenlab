# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPhaseStarted do
  let(:campaign) { create(:project_phase_started_campaign) }

  describe 'ProjectPhaseStarted Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe '#campaign_enabled?' do
    context 'when campaign is is enabled at campaign level' do
      it 'returns false when campaign is disabled at phase level' do
        phase = create(:phase, campaigns_settings: { project_phase_started: false })
        notification = create(:project_phase_started, phase: phase)
        notification_activity = create(:activity, item: notification, action: 'created')

        expect(campaign.enabled).to be true
        expect(campaign.send(:campaign_enabled?, activity: notification_activity)).to be false
      end

      it 'returns true when campaign is enabled at phase level' do
        phase = create(:phase, campaigns_settings: { project_phase_started: true })
        notification = create(:project_phase_started, phase: phase)
        notification_activity = create(:activity, item: notification, action: 'created')

        expect(campaign.enabled).to be true
        expect(campaign.send(:campaign_enabled?, activity: notification_activity)).to be true
      end
    end

    context 'when campaign is is disabled at campaign level' do
      it 'returns false when campaign is disabled at phase level' do
        phase = create(:phase, campaigns_settings: { project_phase_started: false })
        notification = create(:project_phase_started, phase: phase)
        notification_activity = create(:activity, item: notification, action: 'created')
        campaign.update(enabled: false)

        expect(campaign.reload.enabled).to be false
        expect(campaign.reload.send(:campaign_enabled?, activity: notification_activity)).to be false
      end

      it 'returns false when campaign is enabled at phase level' do
        phase = create(:phase, campaigns_settings: { project_phase_started: true })
        notification = create(:project_phase_started, phase: phase)
        notification_activity = create(:activity, item: notification, action: 'created')
        campaign.update(enabled: false)

        expect(campaign.reload.enabled).to be false
        expect(campaign.reload.send(:campaign_enabled?, activity: notification_activity)).to be false
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPhaseStarted do
  let(:campaign) { create(:project_phase_started_campaign) }

  describe 'ProjectPhaseStarted Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe '#campaign_enabled_for_phase?' do
    it 'returns false when campaign is disabled at phase level' do
      phase = create(:phase, campaigns_settings: { project_phase_started: false })
      notification = create(:project_phase_started, phase: phase)
      notification_activity = create(:activity, item: notification, action: 'created')

      expect(campaign.reload.send(:campaign_enabled_for_phase?, activity: notification_activity)).to be false
    end

    it 'returns true when campaign is enabled at phase level' do
      phase = create(:phase, campaigns_settings: { project_phase_started: true })
      notification = create(:project_phase_started, phase: phase)
      notification_activity = create(:activity, item: notification, action: 'created')

      expect(campaign.reload.send(:campaign_enabled_for_phase?, activity: notification_activity)).to be true
    end
  end

  describe '#generate_commands' do
    context 'phase is not a voting phase' do
      let(:project) { create(:project_with_current_phase) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'generates a command with the desired payload and tracked content' do
        campaign = create(:project_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command.dig(:event_payload, :phase_title_multiloc))
          .to eq project.phases.last.title_multiloc
      end
    end

    context 'phase is a voting phase' do
      let(:project) { create(:project_with_active_budgeting_phase) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'does not generate any payload' do
        campaign = create(:project_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command).to be_nil
      end
    end
  end
end

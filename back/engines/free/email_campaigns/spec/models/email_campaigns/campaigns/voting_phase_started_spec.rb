# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::VotingPhaseStarted do
  describe 'VotingPhaseStarted Campaign default factory' do
    it 'is valid' do
      expect(build(:voting_phase_started_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    context 'phase is a voting phase' do
      let(:project) { create(:project_with_active_budgeting_phase) }
      let(:idea) { create(:idea, project: project) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'generates a command with the desired payload and tracked content' do
        project.phases.last.ideas << idea
        campaign = create(:voting_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command.dig(:event_payload, :project_title_multiloc))
          .to eq project.title_multiloc
        expect(command.dig(:event_payload, :phase_title_multiloc))
          .to eq project.phases.last.title_multiloc
        expect(command.dig(:event_payload, :ideas, 0, :title_multiloc))
          .to eq idea.title_multiloc
      end
    end

    context 'phase is not a voting phase' do
      let(:project) { create(:project_with_current_phase) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'does not generate any payload' do
        campaign = create(:voting_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command).to be_nil
      end
    end
  end
end

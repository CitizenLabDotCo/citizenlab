# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::VotingResults do
  describe 'VotingResults Campaign default factory' do
    it 'is valid' do
      expect(build(:voting_results_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    context 'phase is a voting phase' do
      let(:project) { create(:project_with_active_budgeting_phase) }
      let(:notification) { create(:voting_results_published, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'generates a command with the desired payload and tracked content' do
        campaign = create(:voting_results_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command.dig(:event_payload, :project_title_multiloc))
          .to eq project.title_multiloc
        expect(command.dig(:event_payload, :phase_title_multiloc))
          .to eq project.phases.last.title_multiloc
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPhaseUpcoming do
  let(:campaign) { create(:project_phase_upcoming_campaign) }

  describe 'ProjectPhaseUpcoming Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe '#generate_commands' do
    let(:project) { create(:project_with_phases) }
    let(:phase) { project.phases.first }
    let(:notification) { create(:project_phase_upcoming, project: project, phase: phase) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the phase details and its admin setup url' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command[:event_payload]).to include(
        phase_title_multiloc: phase.title_multiloc,
        phase_start_at: phase.start_at,
        phase_end_at: phase.end_at,
        phase_description_multiloc: phase.description_multiloc,
        phase_setup_url: "http://example.org/admin/projects/#{project.id}/phases/#{phase.id}/setup"
      )
    end
  end
end

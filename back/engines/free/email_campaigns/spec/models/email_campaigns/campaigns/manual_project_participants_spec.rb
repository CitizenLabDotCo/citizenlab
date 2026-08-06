# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ManualProjectParticipants do
  subject { build(:manual_project_participants_campaign, context: create(:project_with_active_ideation_phase)) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'validate context_id' do
    it { is_expected.to validate_presence_of(:context) }

    it 'destroys the campaign when the project is destroyed' do
      campaign = create(:manual_project_participants_campaign)
      project = campaign.context
      project.destroy!
      expect { project.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { campaign.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe '#apply_recipient_filters' do
    let_it_be(:non_participant, reload: true) { create(:user) }
    let_it_be(:participant, reload: true) { create(:user) }
    let_it_be(:project, reload: true) { create(:project_with_active_ideation_phase) }
    let_it_be(:idea, reload: true) { create(:idea, project: project, author: participant, publication_status: 'published', phases: project.phases) }
    let_it_be(:follower, reload: true) do
      user = create(:user)
      create(:follower, followable: project, user: user)
      user
    end
    let_it_be(:campaign, reload: true) { create(:manual_project_participants_campaign, context: project) }

    it 'includes project participants and followers' do
      recipients = campaign.apply_recipient_filters

      expect(recipients).to contain_exactly(participant, follower)
    end
  end
end

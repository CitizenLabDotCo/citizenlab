# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ManualProjectParticipants do
  subject { build(:manual_project_participants_campaign, project: create(:project_with_active_ideation_phase)) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'validate resource_id' do
    it 'is invalid if resource_id is blank' do
      campaign = build(:manual_project_participants_campaign, resource_id: nil)
      expect(campaign).to be_invalid
    end

    it 'is invalid if resource_id is not a project ID' do
      campaign = build(:manual_project_participants_campaign, resource_id: SecureRandom.uuid)
      expect(campaign).to be_invalid
    end
  end

  describe '#apply_recipient_filters' do
    let(:non_participant) { create(:user) }
    let(:participant) { create(:user) }
    let(:project) { create(:project_with_active_ideation_phase) }
    let!(:idea) { create(:idea, project: project, author: participant, publication_status: 'published', phases: project.phases) }
    let(:campaign) { create(:manual_project_participants_campaign, project: project) }

    it 'includes only project participants' do
      recipients = campaign.apply_recipient_filters

      expect(recipients).to match_array [participant]
    end
  end
end

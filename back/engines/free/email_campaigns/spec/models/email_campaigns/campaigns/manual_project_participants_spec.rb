# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::Manual do
  describe 'ManualProjectParticipants Campaign default factory' do
    it 'is valid' do
      expect(build(:manual_project_participants_campaign)).to be_valid
    end
  end

  describe 'validate project fk' do
    it 'is invalid if project fk is blank' do
      campaign = build(:manual_project_participants_campaign, project: nil)
      expect(campaign).to be_invalid
    end

    it 'is valid if project fk provided' do
      campaign = build(:manual_project_participants_campaign, project: create(:project))
      expect(campaign).to be_valid
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

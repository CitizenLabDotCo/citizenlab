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
end

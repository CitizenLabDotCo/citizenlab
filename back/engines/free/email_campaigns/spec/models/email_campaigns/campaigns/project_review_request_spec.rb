# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectReviewRequest do
  describe 'ProjectReviewRequest Campaign default factory' do
    it 'is valid' do
      expect(build(:project_review_request_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:project_review_request_campaign) }
    let(:notification) { create(:project_review_request) }
    let(:activity) { create(:activity, item: notification, action: 'created') }

    it 'generates the correct commands' do
      commands = campaign.generate_commands(
        recipient: notification.recipient,
        activity: activity
      )

      expect(commands).to be_an(Array)
      expect(commands.size).to eq(1)
      expect(commands[0][:event_payload]).to eq(
        project_review_id: notification.project_review_id
      )
    end
  end
end

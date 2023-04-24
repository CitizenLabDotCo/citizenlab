# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::StatusChangeOfVotedIdea do
  describe 'StatusChangeOfVotedIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:status_change_of_voted_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:status_change_of_voted_idea_campaign) }
    let(:old_status) { create(:idea_status) }
    let(:idea) { create(:idea, idea_status: create(:idea_status)) }
    let!(:vote) { create(:vote, votable: idea) }
    let(:initiator) { create(:admin) }
    let(:activity) do
      create(
        :activity, item: idea, action: 'changed_status', user: initiator,
        payload: { change: [old_status.id, idea.idea_status.id] }
      )
    end

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: vote.user, activity: activity).first

      expect(command.dig(:event_payload, :post_id)).to eq(idea.id)
      expect(command.dig(:event_payload, :idea_status_code)).to eq(idea.idea_status.code)
    end
  end
end

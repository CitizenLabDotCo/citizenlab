# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProposalExpiredForAdmin do
  describe 'ProposalExpiredForAdmin campaign default factory' do
    it 'is valid' do
      expect(build(:proposal_expired_for_admin_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:proposal_expired_for_admin_campaign) }
    let(:notification) { create(:proposal_expired_for_admin) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match({
        event_payload: hash_including(
          idea_title_multiloc: notification.idea.title_multiloc,
          idea_author_name: an_instance_of(String),
          idea_url: an_instance_of(String)
        )
      })
    end
  end
end

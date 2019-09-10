require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteAccepted, type: :model do
  describe "InviteAccepted Campaign default factory" do
    it "is valid" do
      expect(build(:invite_accepted_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:invite_accepted_campaign) }
    let(:notification) { create(:invite_accepted, invite: create(:accepted_invite)) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :initiating_user_first_name)
      	).to eq(notification.initiating_user.first_name)
  	end
  end
end

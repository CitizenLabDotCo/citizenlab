require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReceived, type: :model do
  describe "InviteReceived Campaign default factory" do
    it "is valid" do
      expect(build(:invite_received_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:invite_received_campaign) }
    let(:invite) { create(:invite) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: invite.invitee, 
        activity: activity
        ).first

      expect(
      	command.dig(:event_payload, :invite, :inviter, :id)
      	).to eq(invite.inviter.id)
      expect(
      	command.dig(:event_payload, :invite, :invitee, :id)
      	).to eq(invite.invitee.id)
      expect(
      	command.dig(:event_payload, :invite, :id)
      	).to eq(invite.id)
  	end
  end
end

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::PasswordReset, type: :model do
  describe "PasswordReset Campaign default factory" do
    it "is valid" do
      expect(build(:password_reset_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:password_reset_campaign) }
    let(:user) { create(:user) }
    let(:activity) { create(:activity, item: user, action: 'requested_password_reset', user: user) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command.dig(:event_payload, :password_reset_url)).to be_present
  	end
  end
end

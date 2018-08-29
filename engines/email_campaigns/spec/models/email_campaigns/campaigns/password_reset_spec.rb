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
    let(:token) { 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImQwMjdkMzQ0LTU0MDYtNGY1Ny1hMjk4LTc3OWQxZjBhOGRkYSIsImV4cCI6MTUzNTU1MTA4NX0.WLXMYAnZ4_jl_tD-d3HIZ7-UE-Km4elalw1of7Mcb7o' }
    let(:activity) { create(:activity, item: user, action: 'requested_password_reset', user: user, payload: {token: token}) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command.dig(:event_payload, :password_reset_url)).to include(token)
  	end
  end
end

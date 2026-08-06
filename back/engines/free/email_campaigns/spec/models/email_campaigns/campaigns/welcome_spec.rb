# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::Welcome do
  describe 'Welcome Campaign default factory' do
    it 'is valid' do
      expect(build(:welcome_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let_it_be(:campaign, reload: true) { create(:welcome_campaign) }
    let_it_be(:user, reload: true) { create(:user) }
    let_it_be(:activity, reload: true) { create(:activity, item: user, action: 'completed_registration', user: user) }

    it 'generates a command with the desired payload and tracked content' do
      commands = campaign.generate_commands(recipient: user, activity: activity)

      expect(commands.size).to eq(1)
    end
  end
end

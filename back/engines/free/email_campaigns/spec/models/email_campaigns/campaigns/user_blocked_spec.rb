# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::UserBlocked do
  describe 'UserBlocked Campaign default factory' do
    it 'is valid' do
      expect(build(:user_blocked_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:user_blocked_campaign) }
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:activity) { create(:activity, item: user, action: 'blocked') }

    it 'generates a single command' do
      commands = campaign.generate_commands(recipient: user, activity: activity)

      expect(commands.size).to eq(1)
    end
  end

  it 'cannot be disabled' do
    expect(build(:user_blocked_campaign).can_be_disabled?).to be(false)
  end

  describe 'triggering through the activity pipeline' do
    let!(:campaign) { create(:user_blocked_campaign) }
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:activity) { create(:activity, item: user, action: 'blocked') }

    it 'delivers the campaign mail when the blocked activity is processed' do
      expect { EmailCampaigns::DeliveryService.new.send_on_activity(activity) }
        .to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end
  end
end

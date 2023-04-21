# frozen_string_literal: true

require 'rails_helper'

class ActivityTriggerableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::ActivityTriggerable
  attr_accessor :activity_triggers
end

RSpec.describe EmailCampaigns::ActivityTriggerable do
  let(:campaign) { ActivityTriggerableCampaignForTest.create! }
  let(:activity) { create(:published_activity) }

  describe 'run_before_send_hooks' do
    it 'returns true when the activity is part of the returned activity_triggers' do
      campaign.activity_triggers = {
        'Idea' => { 'published' => true },
        'Comment' => { 'created' => true }
      }
      expect(campaign.run_before_send_hooks(activity: activity)).to be true
    end

    it 'returns false when the activity is not part of the returned activity_triggers' do
      campaign.activity_triggers = {
        'Comment' => { 'created' => true }
      }

      expect(campaign.run_before_send_hooks(activity: activity)).to be_falsy
    end

    it 'returns false if no activity is specified' do
      expect(campaign.run_before_send_hooks).to be_falsy
    end
  end
end

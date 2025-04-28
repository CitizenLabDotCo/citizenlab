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

    it 'returns false if the activity acted_at is more than 7 days ago' do
      activity = create(:published_activity, acted_at: 8.days.ago)
      campaign.activity_triggers = {
        'Idea' => { 'published' => true }
      }

      expect(campaign.run_before_send_hooks(activity: activity)).to be_falsy
    end

    it 'creates a create an error report if the activity is too old' do
      activity = create(:published_activity, acted_at: 8.days.ago)
      campaign.activity_triggers = {
        'Idea' => { 'published' => true }
      }

      expect(ErrorReporter).to receive(:report_msg).with(
        'ActivityTriggerable attempted to process an old activity',
        extra: {
          activity_id: activity.id,
          activity_type: activity.item_type,
          activity_action: activity.action,
          activity_acted_at: activity.acted_at,
          campaign_id: campaign.id,
          campaign_type: campaign.class.name
        }
      )

      campaign.run_before_send_hooks(activity: activity)
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::BaseManual do
  describe 'filter hooks' do
    let(:campaign) { create(:manual_campaign) }

    context 'without schedule (not scheduled)' do
      it 'allows send_now (no time, no activity)' do
        expect(campaign.run_filter_hooks).to be true
      end

      it 'rejects schedule-triggered sends (time present)' do
        expect(campaign.run_filter_hooks(time: Time.zone.now)).to be false
      end

      it 'rejects activity-triggered sends' do
        activity = instance_double(Activity)
        expect(campaign.run_filter_hooks(activity: activity)).to be false
      end
    end

    context 'with scheduled_at set' do
      let(:campaign) { create(:manual_campaign, scheduled_at: 2.hours.from_now) }

      it 'allows send_now' do
        expect(campaign.run_filter_hooks).to be true
      end

      it 'rejects cron-triggered sends (time present)' do
        expect(campaign.run_filter_hooks(time: Time.zone.now)).to be false
      end

      it 'rejects activity-triggered sends' do
        activity = instance_double(Activity)
        expect(campaign.run_filter_hooks(activity: activity)).to be false
      end
    end
  end

  describe 'scheduled_at virtual attribute' do
    it 'returns nil when no schedule is set' do
      campaign = create(:manual_campaign)
      expect(campaign.scheduled_at).to be_nil
    end

    it 'returns the scheduled time when set' do
      scheduled_time = 2.hours.from_now
      campaign = create(:manual_campaign, scheduled_at: scheduled_time)
      expect(campaign.scheduled_at).to be_within(1.second).of(scheduled_time)
    end

    it 'clears the schedule when set to nil' do
      campaign = create(:manual_campaign, scheduled_at: 2.hours.from_now)
      campaign.update!(scheduled_at: nil)
      expect(campaign.scheduled_at).to be_nil
    end

    it 'stores the schedule in the schedule JSONB column' do
      campaign = create(:manual_campaign, scheduled_at: 2.hours.from_now)
      expect(campaign.schedule).to be_present
      expect(campaign.ic_schedule.rtimes.size).to eq 1
    end
  end

  describe 'clear_scheduled_at' do
    it 'clears the schedule when scheduled_at is present' do
      campaign = create(:manual_campaign, scheduled_at: 2.hours.from_now)
      expect(campaign.scheduled_at).to be_present
      campaign.clear_scheduled_at
      expect(campaign.reload.scheduled_at).to be_nil
    end

    it 'does nothing when scheduled_at is blank' do
      campaign = create(:manual_campaign)
      expect { campaign.clear_scheduled_at }.not_to change { campaign.reload.updated_at }
    end
  end

  describe 'scheduled_at validation' do
    it 'is valid without scheduled_at' do
      campaign = build(:manual_campaign, scheduled_at: nil)
      expect(campaign).to be_valid
    end

    it 'is valid with scheduled_at in the future' do
      campaign = build(:manual_campaign, scheduled_at: 1.hour.from_now)
      expect(campaign).to be_valid
    end

    it 'is invalid with scheduled_at in the past' do
      campaign = build(:manual_campaign, scheduled_at: 1.hour.ago)
      expect(campaign).not_to be_valid
      expect(campaign.errors.details[:scheduled_at]).to include(error: :in_the_past)
    end
  end
end

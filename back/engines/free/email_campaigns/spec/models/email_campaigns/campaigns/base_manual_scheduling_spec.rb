# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::BaseManual do
  describe '#only_manual_send filter' do
    let(:campaign) { create(:manual_campaign) }

    context 'without scheduled_at' do
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

    context 'with scheduled_at in the past' do
      let(:campaign) do
        c = create(:manual_campaign)
        c.update_column(:scheduled_at, 1.hour.ago)
        c.reload
      end

      it 'allows send_now' do
        expect(campaign.run_filter_hooks).to be true
      end

      it 'allows schedule-triggered send when time >= scheduled_at' do
        expect(campaign.run_filter_hooks(time: Time.zone.now)).to be true
      end

      it 'rejects activity-triggered sends' do
        activity = instance_double(Activity)
        expect(campaign.run_filter_hooks(activity: activity)).to be false
      end
    end

    context 'with scheduled_at in the future' do
      let(:campaign) { create(:manual_campaign, scheduled_at: 2.hours.from_now) }

      it 'rejects schedule-triggered send when time < scheduled_at' do
        expect(campaign.run_filter_hooks(time: Time.zone.now)).to be false
      end

      it 'allows schedule-triggered send when time >= scheduled_at' do
        expect(campaign.run_filter_hooks(time: 3.hours.from_now)).to be true
      end
    end

    context 'when already sent' do
      let(:campaign) do
        c = create(:manual_campaign)
        c.update_column(:scheduled_at, 1.hour.ago)
        c.reload
      end

      before { create(:delivery, campaign: campaign) }

      it 'rejects schedule-triggered send' do
        expect(campaign.run_filter_hooks(time: Time.zone.now)).to be false
      end
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

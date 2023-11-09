# frozen_string_literal: true

require 'rails_helper'

class SchedulableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Schedulable
end

RSpec.describe EmailCampaigns::Schedulable do
  let(:config_timezone) { AppConfiguration.timezone }
  let :schedule do
    IceCube::Schedule.new(config_timezone.local(2018)) do |s|
      s.add_recurrence_rule(
        IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
      )
    end
  end
  let(:campaign) { SchedulableCampaignForTest.create!(ic_schedule: schedule) }

  describe 'run_before_send_hooks' do
    it 'allows sending when and only when the passed time is within half an hour of the scheduled target' do
      time = config_timezone.local(2018, 8, 13, 10)
      expect(campaign.run_before_send_hooks(time: time)).to be true
      expect(campaign.run_before_send_hooks(time: time - 30.minutes)).to be true
      expect(campaign.run_before_send_hooks(time: time + 30.minutes)).to be true
      expect(campaign.run_before_send_hooks(time: time - 31.minutes)).to be false
      expect(campaign.run_before_send_hooks(time: time + 31.minutes)).to be false
    end
  end

  describe 'schedule' do
    it 'is always stored with the start_time in the configured timezone' do
      schedule.start_time = Time.find_zone('US/Arizona').local(2018, 8, 13, 10)
      campaign.ic_schedule = schedule
      campaign.save!
      expect(campaign.reload.ic_schedule.start_time.utc_offset).to eq config_timezone.local(2018, 8, 13).utc_offset
    end
  end
end

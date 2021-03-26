require 'rails_helper'


RSpec.describe EmailCampaigns::Schedulable, type: :model do

  class SchedulableCampaign < EmailCampaigns::Campaign
    include EmailCampaigns::Schedulable
  end

  before do
    @config_timezone = AppConfiguration.instance.settings('core','timezone')
    @schedule = IceCube::Schedule.new(Time.find_zone(@config_timezone).local(2018)) do |s|
      s.add_recurrence_rule(
        IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
      )
    end
    @campaign = SchedulableCampaign.create(ic_schedule: @schedule)
  end
  
  describe "run_before_send_hooks" do
    it "allows sending when and only when the passed time is within half an hour of the scheduled target" do
      time = Time.find_zone(@config_timezone).local(2018,8,13,10)
      expect(@campaign.run_before_send_hooks(time: time)).to be_truthy
      expect(@campaign.run_before_send_hooks(time: time-30.minutes)).to be_truthy
      expect(@campaign.run_before_send_hooks(time: time+30.minutes)).to be_truthy
      expect(@campaign.run_before_send_hooks(time: time-31.minutes)).to be_falsey
      expect(@campaign.run_before_send_hooks(time: time+31.minutes)).to be_falsey
    end
  end

  describe "schedule" do
    it "is always stored with the start_time in the configured timezone" do
      @schedule.start_time = Time.find_zone('US/Arizona').local(2018,8,13,10)
      @campaign.ic_schedule=@schedule
      @campaign.save
      expect(@campaign.reload.ic_schedule.start_time.utc_offset).to eq Time.find_zone(@config_timezone).local(2018,8,13).utc_offset
    end
  end

end

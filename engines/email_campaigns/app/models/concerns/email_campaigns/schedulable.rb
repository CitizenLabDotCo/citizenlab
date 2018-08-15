module EmailCampaigns
  module Schedulable
    extend ActiveSupport::Concern

    included do
      validates :schedule, presence: true

      add_send_filter :filter_campaign_scheduled

      unless respond_to? :default_schedule
        raise "Class #{self.name} includes Schedulable but doesn't implement #default_schedule"
      end
    end

    def filter_campaign_scheduled time:
      ic_schedule = IceCube::Schedule.from_hash(self.schedule || self.class.default_schedule)
      time_in_zone = time.in_time_zone(Tenant.settings('core','timezone'))
      ic_schedule.occurs_between?(time_in_zone-30.minutes, time_in_zone+30.minutes)
    end

  end
end
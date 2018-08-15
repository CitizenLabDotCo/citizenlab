module EmailCampaigns
  module Schedulable
    extend ActiveSupport::Concern

    included do
      validates :schedule, presence: true

      add_send_filter :filter_campaign_scheduled
      before_validation :force_schedule_start_in_tenant_timezone
    end

    def filter_campaign_scheduled time:, activity: nil
      ic_schedule.occurs_between?(time-30.minutes, time+30.minutes)
    end

    def ic_schedule
      IceCube::Schedule.from_hash(self.schedule || self.class.default_schedule)
    end

    def ic_schedule= ics
      self.schedule = ics.to_hash
    end

    # Ice cube assumes all rules are expressed in the same timezone as the
    # start_time, so we force it to be in the tenant timezone
    def force_schedule_start_in_tenant_timezone
      ics = ic_schedule
      ics.start_time = ics.start_time.in_time_zone(Tenant.settings('core','timezone'))
      self.ic_schedule = ics
    end

  end
end
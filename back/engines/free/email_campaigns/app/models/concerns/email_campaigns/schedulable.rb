# frozen_string_literal: true

module EmailCampaigns
  module Schedulable
    extend ActiveSupport::Concern

    included do
      validates :schedule, presence: true

      before_send :filter_campaign_scheduled
      before_validation :force_schedule_start_in_config_timezone
    end

    def filter_campaign_scheduled(time:, activity: nil)
      # TODO: prevent being here when time is nil
      # This happened when triggering comment on your comment notification
      time = time&.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))
      time && ic_schedule.occurs_between?(time - 30.minutes, time + 30.minutes)
    end

    def ic_schedule
      if schedule.blank?
        self.class.default_schedule
      else
        IceCube::Schedule.from_hash(schedule)
      end
    end

    def ic_schedule=(ics)
      self.schedule = ics.to_hash
    end

    # Ice cube assumes all rules are expressed in the same timezone as the
    # start_time, so we force it to be in the timezone from settings.
    def force_schedule_start_in_config_timezone
      ics = ic_schedule
      ics.start_time = ics.start_time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))
      self.ic_schedule = ics
    end

    def schedule_multiloc_value(locale)
      # We currently only support weekly schedules here.
      weekly_day_key = "email_campaigns.schedules.weekly.#{schedule['rrules'][0]['validations']['day'][0].to_i % 7}"
      hour = schedule['rrules'][0]['validations']['hour_of_day'][0].to_i
      hour_of_day = LocalizationService.new.hour_of_day_string(hour, locale)

      I18n.t(weekly_day_key, hourOfDay: hour_of_day)
    end
  end
end

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
      return unless time

      time = AppConfiguration.timezone.at(time)
      ic_schedule.occurs_between?(time - 30.minutes, time + 30.minutes)
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
      ics.start_time = AppConfiguration.timezone.at(ics.start_time)
      self.ic_schedule = ics
    end

    def schedule_multiloc_value
      rules = schedule['rrules'][0]
      return unless rules

      # Quarterly schedule
      if rules['rule_type'] == 'IceCube::MonthlyRule' && rules['interval'] == 3
        return I18n.t('email_campaigns.schedules.quarterly')
      end

      # Weekly schedule
      weekly_day_key = "email_campaigns.schedules.weekly.#{rules['validations']['day'][0].to_i % 7}"
      hour = rules['validations']['hour_of_day'][0].to_i
      time_obj = Time.new(-2000, 1, 1, hour, 0, 0)

      I18n.t(weekly_day_key, hourOfDay: (LocalizationService.new.hour_of_day time_obj))
    end
  end
end

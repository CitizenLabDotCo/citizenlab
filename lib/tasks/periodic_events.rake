require 'ice_cube'



@user_weekly_digest_schedule = IceCube::Schedule.new
@user_weekly_digest_schedule.add_recurrence_rule(
  # every other Monday at 10AM
  IceCube::Rule.weekly(2).day(:thursday).hour_of_day(19) 
)


namespace :periodic_events do
  desc "Sends out the periodic events used for sending out e.g. weekly user digest emails."
  task :schedule_email_campaigns => [:environment] do |t, args|
    [[UserWeeklyDigestJob, @user_weekly_digest_schedule]].each do |job, schedule|
      Tenant.all.each do |tenant|
        Apartment::Tenant.switch(tenant.schema_name) do
          now_over_there = Time.now.in_time_zone tenant.settings.dig('core','timezone')
          tz_diff = (now_over_there.hour - Time.now.hour) % 24
          true_schedule_first = schedule.first - tz_diff.hours # because the other one is fake
          if (now_over_there - 30.minutes) < true_schedule_first and (now_over_there + 30.minutes) > true_schedule_first
            byebug
            job.perform_later
          end
        end
      end
    end
  end
end
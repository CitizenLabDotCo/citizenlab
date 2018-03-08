require 'ice_cube'



@user_weekly_digest_schedule = IceCube::Schedule.new
@user_weekly_digest_schedule.add_recurrence_rule(
  # every other Monday at 10AM
  # IceCube::Rule.weekly(2).day(:thursday).hour_of_day(16)
  IceCube::Rule.weekly.day(:thursday).hour_of_day(15) # hour in Universal Timezone!
)


namespace :periodic_events do
  desc "Sends out the periodic events used for sending out e.g. weekly user digest emails."
  task :perform_schedule => [:environment] do |t, args|
    [[UserWeeklyDigestJob, @user_weekly_digest_schedule]].each do |job, schedule|
      Tenant.all.each do |tenant|
        Apartment::Tenant.switch(tenant.schema_name) do
          now_over_there = Time.now.in_time_zone tenant.settings.dig('core','timezone')
          if schedule.occurs_between?(now_over_there - 30.minutes, now_over_there + 30.minutes)
            job.perform_later
          end
        end
      end
    end
  end
end
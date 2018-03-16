require 'ice_cube'



@user_weekly_digest_schedule = IceCube::Schedule.new
@user_weekly_digest_schedule.add_recurrence_rule(
  # every other Monday at 10AM
  IceCube::Rule.weekly(2).day(:monday).hour_of_day(10) 
)


namespace :periodic_events do
  desc "Sends out the periodic events used for sending out e.g. weekly user digest emails."
  task :schedule_email_campaigns, [:force_schedule, :tenant_whitelist] => [:environment] do |t, args|
    force_schedule = args.with_defaults(force_schedule: false).dig(:force_schedule)
    force_schedule = force_schedule && !(force_schedule == 'false')
    tenant_hosts = args.with_defaults(tenant_whitelist: nil).dig(:tenant_whitelist)&.split(' ') || Tenant.all.map(&:host)
    [[EmailCampaigns::UserWeeklyDigestJob, @user_weekly_digest_schedule]].each do |job, schedule|
      tenant_hosts.each do |host|
        Apartment::Tenant.switch(host.gsub '.', '_') do
          now_over_there = Time.now.in_time_zone Tenant.current.settings.dig('core','timezone')
          tz_diff = (now_over_there.hour - Time.now.hour) % 24
          true_schedule_first = schedule.first - tz_diff.hours # because the other one is fake
          if ( force_schedule or 
               ( (now_over_there - 30.minutes) < true_schedule_first and 
                 (now_over_there + 30.minutes) > true_schedule_first))
            job.perform_later
          end
        end
      end
    end
  end
end
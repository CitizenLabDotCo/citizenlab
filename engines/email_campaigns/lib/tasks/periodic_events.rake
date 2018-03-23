require 'ice_cube'


USER_PLATFORM_DIGEST_DAY = ENV.fetch("USER_PLATFORM_DIGEST_DAY", :monday).to_sym
USER_PLATFORM_DIGEST_HOUR = ENV.fetch("USER_PLATFORM_DIGEST_HOUR", 10).to_i
ADMIN_WEEKLY_REPORT_DAY = ENV.fetch("ADMIN_WEEKLY_REPORT_DAY", :monday).to_sym
ADMIN_WEEKLY_REPORT_HOUR = ENV.fetch("ADMIN_WEEKLY_REPORT_HOUR", 10).to_i



@campaign_jobs = {
  'user_platform_digest'             => "EmailCampaigns::UserPlatformDigestJob",
  'admin_weekly_report'              => "EmailCampaigns::AdminWeeklyReportJob",
  'moderator_digest'                 => "EmailCampaigns::ModeratorDigestJob",
  'user_activity_on_your_ideas'      => "EmailCampaigns::UserActivityOnYourIdeasJob",
  'user_updates_on_supported_ideas'  => "EmailCampaigns::UserUpdatesOnSupportedIdeasJob",
  'user_participation_opportunities' => "EmailCampaigns::UserParticipationOpportunitiesJob"
}

# never schedule (i.e. scheduled in a 1000 years - 2 months from the time the code is ran) 
@never_schedule = IceCube::Schedule.new
@never_schedule.add_recurrence_rule(
  IceCube::Rule.yearly(1000).month_of_year((Time.now.month - 2) % 12)
)
# user platform digests, every Monday at 10AM
@user_platform_digest_schedule = IceCube::Schedule.new(now=Time.at(0))
@user_platform_digest_schedule.add_recurrence_rule(
  IceCube::Rule.weekly(1).day(USER_PLATFORM_DIGEST_DAY).hour_of_day(USER_PLATFORM_DIGEST_HOUR) 
)
# admin weekly report, every Monday at 10AM
@admin_weekly_report_schedule = IceCube::Schedule.new(now=Time.at(0))
@admin_weekly_report_schedule.add_recurrence_rule(
  IceCube::Rule.weekly(1).day(ADMIN_WEEKLY_REPORT_DAY).hour_of_day(ADMIN_WEEKLY_REPORT_HOUR) 
)
@campaign_schedules = {
  'user_platform_digest'             => @user_platform_digest_schedule,
  'admin_weekly_report'              => @admin_weekly_report_schedule,
  'moderator_digest'                 => @never_schedule,
  'user_activity_on_your_ideas'      => @never_schedule,
  'user_updates_on_supported_ideas'  => @never_schedule,
  'user_participation_opportunities' => @never_schedule
}


namespace :periodic_events do
  desc "Sends out the periodic events used for sending out e.g. weekly user digest emails."
  task :schedule_email_campaigns, [:force_schedule, :tenant_whitelist] => [:environment] do |t, args|
    force_schedule = args.with_defaults(force_schedule: false).dig(:force_schedule)
    force_schedule = force_schedule && !(force_schedule == 'false')
    tenant_hosts = args.with_defaults(tenant_whitelist: nil).dig(:tenant_whitelist)&.split(' ') || Tenant.all.map(&:host)

    EmailCampaigns::CampaignEmailCommand::CAMPAIGNS.each do |campaign|
      schedule = @campaign_schedules[campaign]
      tenant_hosts.each do |host|
        Apartment::Tenant.switch(host.gsub '.', '_') do
          now_over_there = Time.now.in_time_zone Tenant.current.settings.dig('core','timezone')
          tz_diff = (now_over_there.hour - Time.now.hour) % 24
          true_schedule_next = schedule.next_occurrence(Time.now) - tz_diff.hours # because the other one is fake
          if ( force_schedule or 
               ( (now_over_there - 30.minutes) < true_schedule_next and 
                 (now_over_there + 30.minutes) > true_schedule_next))
            job = @campaign_jobs[campaign].constantize
            job.perform_later
          end
        end
      end
    end
  end
end
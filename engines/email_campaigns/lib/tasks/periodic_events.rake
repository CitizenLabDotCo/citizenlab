
namespace :periodic_events do
  desc "Sends out the scheduled email campaigns that are due. Needs to be called every hour on the hour"
  task :schedule_email_campaigns => :environment do |t, args|
    time = Time.now
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        EmailCampaigns::TriggerOnScheduleJob.perform_later(time.to_i)
      end
    end
  end
end
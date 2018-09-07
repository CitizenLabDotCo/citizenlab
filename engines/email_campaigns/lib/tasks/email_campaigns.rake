
namespace :email_campaigns do
  desc "Sends out the scheduled email campaigns that are due. Needs to be called every hour on the hour"
  task :schedule_email_campaigns => :environment do |t, args|
    time = Time.now
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        EmailCampaigns::TriggerOnScheduleJob.perform_later(time.to_i)
      end
    end
  end

  desc "Makes sure that campaign records exist for all built-in campaigns. Should run on deployment through CI"
  task :assure_campaign_records => :environment do |t, args|
    service = EmailCampaigns::AssureCampaignsService.new
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        service.assure_campaigns
      end
    end
  end

end
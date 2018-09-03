
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
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        
        instantiatable_campaign_types = (EmailCampaigns::DeliveryService.new.campaign_types - ["EmailCampaigns::Campaigns::Manual"])

        type_counts = EmailCampaigns::Campaign
          .where(type: instantiatable_campaign_types)
          .group(:type).count

        instantiatable_campaign_types.each do |type|
          unless type_counts[type]
            claz = type.constantize
            claz.create!
          end
        end
      end
    end
  end

end
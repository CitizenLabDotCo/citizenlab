
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

  desc "Given a list of email addresses, remove these users' consent from all consentable campaigns"
  task :remove_consents, [:emails_url] => [:environment] do |t, args|

    emails = open(args[:emails_url]).readlines.map(&:strip).map(&:downcase)
    puts "Found #{emails.size} emails"

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        users = User.where(email: emails).all
        puts "Found #{users.size} users in #{tenant.name}"

        users.each do |user|
          consentable_campaign_types = EmailCampaigns::DeliveryService.new.consentable_campaign_types_for(user)
          consentable_campaign_types.each do |campaign_type|
            EmailCampaigns::Consent
              .find_or_initialize_by(user_id: user.id, campaign_type: campaign_type)
              .update_attributes!(consented: false)
          end
        end
      end
    end
  end

  desc "Ensure that all existing users have unsubscription tokens"
  task :ensure_unsubscription_tokens => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        ids = User
          .left_joins(:email_campaigns_unsubscription_token)
          .where(email_campaigns_unsubscription_tokens: {token: nil}).ids.each do |user_id|
          EmailCampaigns::UnsubscriptionToken.create!(user_id: user_id)
        end
      end
    end
  end

end
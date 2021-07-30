namespace :email_campaigns do
  desc "Sends out the scheduled email campaigns that are due. Needs to be called every hour on the hour"
  task :schedule_email_campaigns => :environment do |t, args|
    EmailCampaigns::TasksService.new.schedule_email_campaigns
  end

  desc "Makes sure that campaign records exist for all built-in campaigns. Should run on deployment through CI"
  task :assure_campaign_records => :environment do |t, args|
    EmailCampaigns::TasksService.new.assure_campaign_records
  end

  desc 'Removes campaigns with a type that no longer exists in `EmailCampaigns::DeliveryService.new.campaign_classes`'
  task remove_deprecated: :environment do |_t, _args|
    EmailCampaigns::TasksService.new.remove_deprecated
  end

  desc "Given a list of email addresses, remove these users' consent from all consentable campaigns"
  task :remove_consents, [:emails_url] => [:environment] do |t, args|
    EmailCampaigns::TasksService.new.remove_consents(args[:emails_url])
  end

  desc "Ensure that all existing users have unsubscription tokens"
  task :ensure_unsubscription_tokens => :environment do
    EmailCampaigns::TasksService.new.ensure_unsubscription_tokens
  end

  desc "Update all user digest schedules"
  task :update_user_digest_schedules => :environment do |t, args|
    EmailCampaigns::TasksService.new.update_user_digest_schedules
  end
end

namespace :debug do
  desc "Broken welcome mail with working error trace"
  task :welcome_mail, [:hosts] => [:environment] do |t, args|
    Apartment::Tenant.switch('localhost') do
      mail = EmailCampaigns::WelcomeMailerPreview.new.campaign_mail
      mail.deliver_now
    end
  end

  task action_mailer_job: :environment do
    Apartment::Tenant.switch('localhost') do
      campaign  = EmailCampaigns::Campaigns::Welcome.first
      recipient = User.first
      command   = campaign.generate_commands.tap { |c| c.first.merge!(recipient: recipient) }.first

      campaign.mailer_class
              .with(campaign: campaign, command: command)
              .campaign_mail
              .deliver_later
    end
  end
end

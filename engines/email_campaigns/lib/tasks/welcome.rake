namespace :debug do

  desc "Broken welcome mail with working error trace"
  task :welcome_mail, [:hosts] => [:environment] do |t, args|
    Apartment::Tenant.switch('localhost') do
      mail = EmailCampaigns::WelcomeMailerPreview.new.campaign_mail
      mail.deliver_now
    end
  end
end

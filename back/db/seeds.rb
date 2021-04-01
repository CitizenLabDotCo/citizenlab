if CitizenLab.ee?
  load Rails.root.join('engines/ee/multi_tenancy/db/seeds/citizenlab-ee.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

if AppConfiguration.exists?
  # Creates unsubscription tokens.
  User.all.each do |user|
    EmailCampaigns::UnsubscriptionToken.create!(user_id: user.id)
  end
  # Creates email campaigns.
  EmailCampaigns::AssureCampaignsService.new.assure_campaigns
end
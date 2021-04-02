if CitizenLab.ee?
  load Rails.root.join('engines/ee/multi_tenancy/db/seeds/citizenlab-ee.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

# Creates unsubscription tokens.
User.find_each do |user|
  EmailCampaigns::UnsubscriptionToken.create!(user_id: user.id)
end

# Creates email campaigns.
EmailCampaigns::TasksService.new.assure_campaign_records

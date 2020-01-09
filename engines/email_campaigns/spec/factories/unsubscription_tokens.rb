FactoryBot.define do
  factory :email_campaigns_unsubscription_token, class: EmailCampaigns::UnsubscriptionToken do
    user
  end
end
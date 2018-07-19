FactoryBot.define do
  factory :campaigns_recipient, :class => EmailCampaigns::CampaignsRecipient do
    campaign
    user
    delivery_status 'sent'
  end
end

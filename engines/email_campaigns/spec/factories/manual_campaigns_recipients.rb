FactoryBot.define do
  factory :manual_campaigns_recipient, :class => EmailCampaigns::ManualCampaignsRecipient do
    manual_campaign
    user
    delivery_status 'sent'
  end
end

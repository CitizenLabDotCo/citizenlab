FactoryBot.define do
  factory :delivery, :class => EmailCampaigns::Delivery do
    campaign
    user
    delivery_status 'sent'
  end
end

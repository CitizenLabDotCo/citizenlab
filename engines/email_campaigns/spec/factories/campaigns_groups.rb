FactoryBot.define do
  factory :campaigns_group, :class => EmailCampaigns::CampaignsGroup do
    campaign
    group
  end
end

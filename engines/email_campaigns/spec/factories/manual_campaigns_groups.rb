FactoryBot.define do
  factory :manual_campaigns_group, :class => EmailCampaigns::ManualCampaignsGroup do
    manual_campaign
    group
  end
end

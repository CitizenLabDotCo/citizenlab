FactoryBot.define do
  factory :consent, :class => EmailCampaigns::Consent do
    campaign_type { 'ManualCampaign' }
    user
    consented { true }
  end
end

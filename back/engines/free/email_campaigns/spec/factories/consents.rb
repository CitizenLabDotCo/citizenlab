# frozen_string_literal: true

FactoryBot.define do
  factory :consent, class: 'EmailCampaigns::Consent' do
    campaign_type { 'EmailCampaigns::Campaigns::Manual' }
    user
    consented { true }
  end
end

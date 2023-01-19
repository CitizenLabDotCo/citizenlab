# frozen_string_literal: true

FactoryBot.define do
  factory :consent, class: EmailCampaigns::Consent do
    campaign_type { 'AdminDigest' }
    user
    consented { true }
  end
end

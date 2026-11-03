# frozen_string_literal: true

FactoryBot.define do
  factory :consent, class: 'EmailCampaigns::Consent' do
    campaign_type { EmailCampaigns::Campaigns::Manual.name }
    user
    consented { true }

    # Manual SMS is opt-in, so its recipients need an explicit consent record.
    trait :sms_manual do
      campaign_type { EmailCampaigns::Campaigns::SmsManual.name }
    end
  end
end

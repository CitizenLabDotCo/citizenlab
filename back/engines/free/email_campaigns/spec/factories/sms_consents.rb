# frozen_string_literal: true

FactoryBot.define do
  factory :sms_consent, class: 'EmailCampaigns::SmsConsent' do
    campaign_type { 'EmailCampaigns::Campaigns::SmsManual' }
    user
    consented { true }
  end
end

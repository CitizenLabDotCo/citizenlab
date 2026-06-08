# frozen_string_literal: true

FactoryBot.define do
  factory :sms_manual_campaign, class: 'EmailCampaigns::Campaigns::SmsManual' do
    enabled { true }
    author
    body_multiloc do
      {
        'en' => 'A short text message for you'
      }
    end
  end
end

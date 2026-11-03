# frozen_string_literal: true

FactoryBot.define do
  factory :delivery, class: 'EmailCampaigns::Delivery' do
    association :campaign, factory: :manual_campaign
    user
    delivery_status { 'sent' }
  end

  factory :sms_delivery, class: 'EmailCampaigns::Sms::Delivery' do
    association :campaign, factory: :sms_manual_campaign
    user
    body { 'A short SMS update.' }
    status { 'sent' }
  end
end

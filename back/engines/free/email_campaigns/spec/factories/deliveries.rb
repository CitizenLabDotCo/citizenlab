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
    # segments_count is derived from the body, so a delivery that should cost more
    # than one segment needs a body long enough to.
    body { 'A short SMS update.' }
    status { 'sent' }
  end
end

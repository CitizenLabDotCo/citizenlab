# frozen_string_literal: true

FactoryBot.define do
  factory :delivery, class: EmailCampaigns::Delivery do
    association :campaign, factory: :admin_rights_received_campaign
    user
    delivery_status { 'sent' }
  end
end

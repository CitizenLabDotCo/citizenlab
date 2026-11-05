# frozen_string_literal: true

FactoryBot.define do
  factory :campaigns_group, class: 'EmailCampaigns::CampaignsGroup' do
    association :campaign, factory: :manual_campaign
    group
  end
end

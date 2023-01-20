# frozen_string_literal: true

FactoryBot.define do
  factory :campaigns_group, class: EmailCampaigns::CampaignsGroup do
    association :campaign, factory: :admin_digest_campaign
    group
  end
end

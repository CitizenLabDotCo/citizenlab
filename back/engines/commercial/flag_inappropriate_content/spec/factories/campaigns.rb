# frozen_string_literal: true

FactoryBot.define do
  factory :inappropriate_content_flagged_campaign, class: 'FlagInappropriateContent::EmailCampaigns::Campaigns::InappropriateContentFlagged' do
    enabled { true }
  end
end

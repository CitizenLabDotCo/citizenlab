# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_email_command, class: 'EmailCampaigns::CampaignEmailCommand' do
    recipient { create(:admin) }
    campaign { 'admin_weekly_report' }
    commanded_at { Time.now }
    tracked_content { {} }
  end
end

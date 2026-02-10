# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_example, class: 'EmailCampaigns::Example' do
    association :campaign, factory: :admin_rights_received_campaign
    association :recipient, factory: :user
    locale { 'en' }
    subject { 'You became an administrator on the platform of Liege' }
    mail_body_html { "<html><body>#{Faker::Lorem.paragraph}</body></html>" }
  end
end

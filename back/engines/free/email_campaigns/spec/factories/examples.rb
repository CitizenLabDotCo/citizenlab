# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_example, class: EmailCampaigns::Example do
    campaign_class { 'EmailCampaigns::Campaigns::AdminRightsReceived' }
    association :recipient, factory: :user
    locale { 'en' }
    subject { 'You became an administrator on the platform of Liege' }
    mail_body_html { Faker::Lorem.paragraph }
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :idea_assigned_to_you_campaign, class: 'IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou' do
    enabled { true }
  end
end

FactoryBot.define do
  factory :idea_assigned_to_you_campaign, class: EmailCampaigns::Campaigns::IdeaAssignedToYou do
    enabled { true }
  end
end

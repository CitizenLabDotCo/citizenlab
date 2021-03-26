FactoryBot.define do
  factory :idea_assigned_to_you, parent: :notification, class: 'IdeaAssignment::Notifications::IdeaAssignedToYou' do
    initiating_user
    association :post, factory: :idea
    project
  end
end

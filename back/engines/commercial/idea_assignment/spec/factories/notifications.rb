# frozen_string_literal: true

FactoryBot.define do
  factory :idea_assigned_to_you, parent: :notification, class: 'IdeaAssignment::Notifications::IdeaAssignedToYou' do
    initiating_user
    idea
    project
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :project_review do
    project
    requester { association :project_moderator, projects: [project] }
    reviewer { association :admin }

    trait :approved do
      approved_at { Time.current }
    end
  end
end

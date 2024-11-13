# frozen_string_literal: true

FactoryBot.define do
  factory :project_review do
    project
    requester { association :user }
    reviewer { association :user }

    trait :approved do
      approved_at { Time.current }
    end
  end
end

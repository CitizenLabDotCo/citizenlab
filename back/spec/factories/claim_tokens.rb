# frozen_string_literal: true

FactoryBot.define do
  factory :claim_token do
    item { association :idea, author: nil }

    trait :expired do
      expires_at { 1.hour.ago }
    end

    trait :pending do
      pending_claimer { association :user }
    end
  end
end

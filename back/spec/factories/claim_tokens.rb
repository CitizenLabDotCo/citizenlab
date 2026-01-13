# frozen_string_literal: true

FactoryBot.define do
  factory :claim_token do
    item factory: :base_idea

    trait :expired do
      expires_at { 1.hour.ago }
    end

    trait :pending do
      pending_claimer factory: :user
    end
  end
end

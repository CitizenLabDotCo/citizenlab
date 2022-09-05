# frozen_string_literal: true

FactoryBot.define do
  factory :user_with_confirmation, parent: :user do
    invite_status { nil }
    registration_completed_at { nil }

    before(:create) do |user, _evaluator|
      user.reset_confirmation_code
    end
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :pulse_check do
    user factory: :admin
    key { 'return_findability' }

    trait :shown do
      status { 'shown' }
      shown_at { Time.zone.now }
    end
  end
end

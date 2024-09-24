# frozen_string_literal: true

FactoryBot.define do
  factory :cosponsorship do
    status { 'pending' }
    association :idea, factory: :idea
    association :user, factory: :user
  end
end

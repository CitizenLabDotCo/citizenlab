# frozen_string_literal: true

FactoryBot.define do
  factory :cosponsorship do
    status { 'pending' }
    association :idea
    association :user
  end
end

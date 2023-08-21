# frozen_string_literal: true

FactoryBot.define do
  factory :follower do
    user
    association :followable, factory: :project
  end
end

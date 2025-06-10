# frozen_string_literal: true

FactoryBot.define do
  factory :related_idea do
    association :idea
    association :related_idea, factory: :idea
  end
end

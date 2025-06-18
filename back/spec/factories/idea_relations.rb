# frozen_string_literal: true

FactoryBot.define do
  factory :idea_relation do
    association :idea
    association :related_idea, factory: :idea
  end
end

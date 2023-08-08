# frozen_string_literal: true

FactoryBot.define do
  factory :baskets_idea do
    votes { 1 }
    basket
    idea
  end
end

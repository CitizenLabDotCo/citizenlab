# frozen_string_literal: true

FactoryBot.define do
  factory :ideas_phase do
    idea
    phase
    votes_count { 0 }
    baskets_count { 0 }
  end
end

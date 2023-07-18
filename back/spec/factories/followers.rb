# frozen_string_literal: true

FactoryBot.define do
  factory :follower do
    user
    followable { create(:project) }
  end
end

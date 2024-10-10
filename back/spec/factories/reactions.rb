# frozen_string_literal: true

FactoryBot.define do
  factory :reaction do
    association :reactable, factory: :idea
    mode { 'up' }
    user

    factory :dislike do
      mode { 'down' }
    end

    factory :comment_reaction do
      association :reactable, factory: :comment
    end
  end
end

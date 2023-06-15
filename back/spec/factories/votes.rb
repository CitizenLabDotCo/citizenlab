# frozen_string_literal: true

FactoryBot.define do
  factory :vote do
    association :votable, factory: :idea
    mode { 'up' }
    user

    factory :downvote do
      mode { 'down' }
    end

    factory :comment_vote do
      association :votable, factory: :comment
    end
  end

  factory :vote2, class: Vote do
    for_idea
    up

    user

    trait :for_idea do
      association :votable, factory: :idea
    end

    trait :for_initiative do
      association :votable, factory: :initiative
    end

    trait :for_comment do
      association :votable, factory: :comment
    end

    trait :up do
      mode { 'up' }
    end

    trait :down do
      mode { 'down' }
    end
  end
end

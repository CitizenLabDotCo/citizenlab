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


  factory :reaction2, class: 'Reaction' do
    for_idea
    up

    user

    trait :for_idea do
      association :reactable, factory: :idea
    end

    trait :for_initiative do
      association :reactable, factory: :initiative
    end

    trait :for_comment do
      association :reactable, factory: :comment
    end

    trait :up do
      mode { 'up' }
    end

    trait :down do
      mode { 'down' }
    end
  end
end

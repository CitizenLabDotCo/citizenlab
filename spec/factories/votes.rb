FactoryBot.define do
  factory :vote do
    association :votable, factory: :idea
    mode { "up" }
    user

    factory :downvote do
      mode { "down" }
    end

    factory :comment_vote do
      association :votable, factory: :comment
    end
  end
end

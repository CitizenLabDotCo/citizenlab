FactoryBot.define do
  factory :vote do
    association :votable, factory: :idea
    mode { "up" }
    user

    factory :downvote do
      mode { "down" }
    end
  end
end

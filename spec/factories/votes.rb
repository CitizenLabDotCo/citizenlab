FactoryBot.define do
  factory :vote do
    association :votable, factory: :idea
    mode "up"
    user
  end
end

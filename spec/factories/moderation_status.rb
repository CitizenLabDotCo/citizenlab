FactoryBot.define do
  factory :moderation_status do
    association :moderatable, factory: :idea
    status { "read" }
  end
end

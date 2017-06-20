FactoryGirl.define do
  factory :activity do
    association :item, factory: :idea
    action "published"
    acted_at {Time.now}
    user
  end
end

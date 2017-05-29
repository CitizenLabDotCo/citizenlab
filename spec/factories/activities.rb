FactoryGirl.define do
  factory :activity do
    association :item, factory: :idea
    action "published"
    user
  end
end

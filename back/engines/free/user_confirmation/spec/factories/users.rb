FactoryBot.define do
  factory :user_with_confirmation, parent: :user do
    after(:create) do |user, evaluator|
      user.reset_confirmation_code!
    end
  end
end

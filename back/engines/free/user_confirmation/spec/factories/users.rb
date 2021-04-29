FactoryBot.define do
  factory :user_with_confirmation, parent: :user do
    before(:create) do |user, evaluator|
      user.reset_confirmation_code
    end
  end
end

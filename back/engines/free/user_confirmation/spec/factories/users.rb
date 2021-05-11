FactoryBot.define do
  factory :user_with_confirmation, parent: :user do
    invite_status { nil }

    before(:create) do |user, evaluator|
      user.reset_confirmation_code
    end
  end
end

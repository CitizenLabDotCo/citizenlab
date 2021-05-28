FactoryBot.define do
  factory :user_with_confirmation, parent: :user do
    invite_status { nil }
    registration_completed_at { nil }

    before(:create) do |user, evaluator|
      user.reset_confirmation_code
    end
  end
end

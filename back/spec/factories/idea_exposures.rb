FactoryBot.define do
  factory :idea_exposure do
    idea
    phase

    trait :with_user do
      user
      visitor_hash { nil }
    end

    trait :anonymous do
      user { nil }
      visitor_hash { SecureRandom.hex(32) }
    end

    # Default to user-based exposure for backwards compatibility
    user
    visitor_hash { nil }
  end
end

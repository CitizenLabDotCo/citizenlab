FactoryBot.define do
  factory :idea_exposure do
    idea
    phase
    user
    visitor_hash { nil }

    trait :anonymous do
      user { nil }
      visitor_hash { SecureRandom.hex(32) }
    end
  end
end

FactoryBot.define do
  factory :spam_report do
    association :spam_reportable, factory: :idea
    reported_at "2017-11-17 15:54:22"
    reason_code "other"
    other_reason "I've seen this text like over a thousand times."
    user
  end
end

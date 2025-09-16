FactoryBot.define do
  factory :invites_import do
    job_type { 'count_new_seats' }
    result { {} }
    completed_at { nil }
    association :importer, factory: :user
  end
end

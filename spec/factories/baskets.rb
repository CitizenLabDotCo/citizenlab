FactoryBot.define do
  factory :basket do
    submitted_at { "2018-09-13 08:51:08" }
    user
    participation_context { create(:continuous_budgeting_project) }
  end
end

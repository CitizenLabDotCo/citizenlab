FactoryBot.define do
  factory :basket do
    submitted_at "2018-09-13 08:51:08"
    user { create(:user) }
    participation_context { create(:continuous_budgeting_project) }
    ideas { create_list(:idea, 3) }
  end
end

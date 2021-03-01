FactoryBot.define do
  factory :assigned_idea, parent: :idea do
    assignee { nil }
  end
end

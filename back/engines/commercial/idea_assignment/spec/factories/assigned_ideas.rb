FactoryBot.define do
  factory :assigned_idea, parent: :idea do
    transient do
      assigned_at { Time.zone.now }
    end
    after(:create) do |idea, evaluator|
      assignee = create(:project_moderator, projects: [idea.project])
      idea.assignee = assignee
      idea.assigned_at = evaluator.assigned_at
    end
  end
end

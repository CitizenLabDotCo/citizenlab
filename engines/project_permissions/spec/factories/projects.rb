# frozen_string_literal: true

FactoryBot.define do
  factory :private_admins_project, parent: :project do
    visible_to { :admins }
  end

  factory :private_groups_project, parent: :project do
    visible_to { 'groups' }

    transient do
      groups_count { 1 }
      user { nil }
    end

    after(:create) do |project, evaluator|
      evaluator.groups_count.times do
        group = create(:group)
        project.groups << group
        group.members << evaluator.user if evaluator&.user
      end
    end

    factory :private_groups_continuous_project do
      process_type { 'continuous' }

      factory :private_groups_continuous_budgeting_project do
        participation_method { 'budgeting' }
        max_budget { 10_000 }
      end
    end
  end
end

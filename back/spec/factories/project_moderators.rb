# frozen_string_literal: true

FactoryBot.define do
  factory :project_moderator, class: 'User', parent: :user do
    transient do
      projects { [create(:project)] }
      project_ids { nil }
    end
    
    after :build do |moderator, evaluator|
      (evaluator.project_ids || evaluator.projects&.compact&.map(&:id)).each do |project_id|
        moderator.add_role('project_moderator', project_id: project_id)
      end

      moderator.confirm
    end
  end
end

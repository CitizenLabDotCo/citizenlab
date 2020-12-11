FactoryBot.define do
  factory :project_folder_moderator, class: User, parent: :user do
    transient do
      project_folder { nil }
      project_folder_id { nil }
    end

    after :build do |moderator, evaluator|
      moderator.add_project_folder_moderator_role(evaluator.project_folder || evaluator.project_folder_id)
    end
  end
end

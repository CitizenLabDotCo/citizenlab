FactoryBot.define do
  factory :project_folder_moderator, class: User, parent: :user do
    transient do
      project_folders { [create(:project_folder)] }
      project_folder_ids { nil }
    end

    after :build do |moderator, evaluator|
      (evaluator.project_folder_ids || evaluator.project_folders&.compact&.map(&:id)).each do |folder_id|
        moderator.add_role('project_folder_moderator', project_folder_id: folder_id)
      end
    end
  end
end

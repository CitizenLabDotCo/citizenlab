FactoryBot.define do
  factory :project_folder_moderator, class: User, parent: :user do
    transient do
      project_folder nil
      project_folder_id nil
    end
  end
end

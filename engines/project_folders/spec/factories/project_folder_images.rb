FactoryBot.define do
  factory :project_folder_image, class: ProjectFolders::Image do
    project_folder
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end

FactoryBot.define do
  factory :project_folder_file, class: ProjectFolders::File do
    project_folder
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

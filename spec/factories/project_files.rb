FactoryBot.define do
  factory :project_file do
    project
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

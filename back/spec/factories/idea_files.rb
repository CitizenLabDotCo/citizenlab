FactoryBot.define do
  factory :idea_file do
    idea
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

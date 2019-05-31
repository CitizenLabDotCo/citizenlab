FactoryBot.define do
  factory :initiative_file do
    initiative
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

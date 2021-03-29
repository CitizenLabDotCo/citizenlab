FactoryBot.define do
  factory :event_file do
    event
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

FactoryBot.define do
  factory :phase_file do
    phase
    file { Rails.root.join("spec/fixtures/afvalkalender.pdf").open }
    name { 'afvalkalender.pdf' }
  end
end

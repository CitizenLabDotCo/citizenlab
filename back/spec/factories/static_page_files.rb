FactoryBot.define do
  factory :static_page_file do
    static_page
    file { Rails.root.join('spec/fixtures/afvalkalender.pdf').open }
    name { 'afvalkalender.pdf' }
  end
end

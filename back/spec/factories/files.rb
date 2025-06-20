# frozen_string_literal: true

FactoryBot.define do
  factory :file, class: 'Files::File' do
    name { 'test_file.txt' }
    content { Rails.root.join('spec/fixtures/afvalkalender.pdf').open }
    association :uploader, factory: :user
  end
end

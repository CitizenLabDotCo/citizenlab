# frozen_string_literal: true

FactoryBot.define do
  factory :custom_page_file do
    custom_page
    file { Rails.root.join('spec/fixtures/afvalkalender.pdf').open }
    name { 'afvalkalender.pdf' }
  end
end

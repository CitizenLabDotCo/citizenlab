# frozen_string_literal: true

FactoryBot.define do
  factory :file_upload do
    idea
    file { Rails.root.join('spec/fixtures/afvalkalender.pdf').open }
    name { 'afvalkalender.pdf' }
  end
end

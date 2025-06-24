# frozen_string_literal: true

FactoryBot.define do
  factory :file, class: 'Files::File' do
    name { 'minimal_pdf.pdf' }
    content { Rails.root.join('spec/fixtures', name).open }
    association :uploader, factory: :user
  end
end

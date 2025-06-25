# frozen_string_literal: true

FactoryBot.define do
  factory :file, class: 'Files::File' do
    name { 'minimal_pdf.pdf' }
    association :uploader, factory: :user

    content do
      Rails.root.join('spec/fixtures', name).open
    rescue Errno::ENOENT
      Rails.root.join('spec/fixtures/minimal_pdf.pdf').open
    end
  end
end

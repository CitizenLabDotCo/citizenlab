# frozen_string_literal: true

FactoryBot.define do
  factory :export_result_file, class: 'Export::ResultFile' do
    tracker factory: :jobs_tracker
    name { 'input_responses.pdf' }
    content { Rails.root.join('spec/fixtures/minimal_pdf.pdf').open }
  end
end

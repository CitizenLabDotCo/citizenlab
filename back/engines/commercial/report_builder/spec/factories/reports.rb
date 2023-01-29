# frozen_string_literal: true

FactoryBot.define do
  factory :report, class: 'ReportBuilder::Report' do
    sequence(:name) { |i| "report-name-#{i}" }
    owner factory: :user
    layout { association :layout, content_buildable: instance, code: 'report' }
  end
end

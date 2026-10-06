# frozen_string_literal: true

FactoryBot.define do
  factory :report, class: 'ReportBuilder::Report' do
    sequence(:name) { |i| "report-name-#{i}" }
    owner factory: :user
    layout { association :layout, content_buildable: instance, code: 'report' }
    visible { false }

    trait :visible do
      visible { true }
    end

    trait :with_phase do
      phase factory: :phase
    end

    trait :with_project do
      project
    end

    trait :with_image do
      layout { association :report_layout, :with_image, content_buildable: instance }
    end
  end
end

FactoryBot.define do
  factory :report_chat, class: 'ReportBuilder::ReportChat' do
    report
    transcript { [] }
  end
end

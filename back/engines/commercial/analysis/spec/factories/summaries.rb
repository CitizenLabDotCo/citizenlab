# frozen_string_literal: true

FactoryBot.define do
  factory :summary, class: 'Analysis::Summary' do
    association :background_task, factory: :summarization_task
    summary { Faker::Lorem.paragraphs }
    summarization_method { 'bogus' }
    insight_attributes do
      {
        filters: {},
        analysis: create(:analysis)
      }
    end
  end
end

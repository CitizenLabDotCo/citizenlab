# frozen_string_literal: true

FactoryBot.define do
  factory :summary, class: 'Analysis::Summary' do
    # insight
    association :background_task, factory: :summarization_task
    summary { Faker::Lorem.paragraphs }
    summarization_method { 'bogus' }
  end
end

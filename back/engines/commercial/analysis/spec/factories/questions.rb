# frozen_string_literal: true

FactoryBot.define do
  factory :analysis_question, class: 'Analysis::Question' do
    association :background_task, factory: :q_and_a_task
    question { Faker::Lorem.paragraphs }
    q_and_a_method { 'bogus' }
    insight_attributes do
      {
        filters: {},
        analysis: create(:analysis),
        bookmarked: false
      }
    end
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :comments_summary, class: 'Analysis::CommentsSummary' do
    idea
    association :background_task, factory: :comments_summarization_task
    summary { Faker::Lorem.paragraphs.join("\n") }
    comments_ids { [] }
  end
end

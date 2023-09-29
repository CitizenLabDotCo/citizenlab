# frozen_string_literal: true

FactoryBot.define do
  factory :auto_tagging_task, class: 'Analysis::AutoTaggingTask' do
    analysis
    state { 'in_progress' }
    started_at { Time.now }
    auto_tagging_method { 'controversial' }
  end

  factory :summarization_task, class: 'Analysis::SummarizationTask' do
    analysis
    state { 'in_progress' }
    started_at { Time.now }
  end

  factory :q_and_a_task, class: 'Analysis::QAndATask' do
    analysis
    state { 'in_progress' }
    started_at { Time.now }
  end
end

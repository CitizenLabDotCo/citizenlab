# frozen_string_literal: true

FactoryBot.define do
  factory :auto_tagging_task, class: 'Analysis::AutoTaggingTask' do
    analysis
    state { 'in_progress' }
    auto_tagging_method { 'controversial' }
  end
end

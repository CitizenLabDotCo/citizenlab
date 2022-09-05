# frozen_string_literal: true

require 'nlp/testing/dummy_task_handler'

FactoryBot.define do
  factory :text_network_analysis_task, aliases: [:tna_task], class: 'NLP::TextNetworkAnalysisTask' do
    sequence(:task_id) { |n| "tna-task-#{n}" }

    handler_class { NLP::Testing::DummyTaskHandler }
  end
end

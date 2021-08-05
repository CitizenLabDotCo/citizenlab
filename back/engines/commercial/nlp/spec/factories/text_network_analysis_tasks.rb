# frozen_string_literal: true

require 'nlp/testing/dummy_task_handler'

FactoryBot.define do
  factory :tna_task, class: 'NLP::TextNetworkAnalysisTask' do
    sequence :task_id
    handler_class { NLP::Testing::DummyTaskHandler }
  end
end

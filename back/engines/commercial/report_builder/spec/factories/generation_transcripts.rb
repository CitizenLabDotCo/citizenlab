# frozen_string_literal: true

FactoryBot.define do
  factory :generation_transcript, class: 'ReportBuilder::GenerationTranscript' do
    association :report
    model { 'eu.anthropic.claude-sonnet-4-6' }
    kind { 'generation' }
    messages { [] }
    usage { { 'input_tokens' => 1000, 'output_tokens' => 200 } }
    stopped_because { 'done' }
  end
end

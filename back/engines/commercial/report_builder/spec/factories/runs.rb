# frozen_string_literal: true

FactoryBot.define do
  factory :report_run, class: 'ReportBuilder::Run' do
    transient do
      report { association :report }
    end

    conversation { report.chat!(locale: 'en') }
    model { 'eu.anthropic.claude-sonnet-4-6' }
    kind { 'generation' }
    usage { { 'input_tokens' => 1000, 'output_tokens' => 200 } }
    stopped_because { 'done' }
  end
end

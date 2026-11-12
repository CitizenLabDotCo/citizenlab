# frozen_string_literal: true

FactoryBot.define do
  # A run of the model on a report: its conversation is the report's chat.
  factory :report_run, parent: :ai_assistant_run do
    transient do
      report { association :report }
    end

    conversation { report.chat!(locale: 'en') }
    kind { 'generation' }
  end
end

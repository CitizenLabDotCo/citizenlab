# frozen_string_literal: true

require 'nlp/text_network_analysis_result'

FactoryBot.define do
  factory :text_network_analysis_result, aliases: [:tna_result], class: 'NLP::TextNetworkAnalysisResult' do
    sequence(:task_id) { |n| "tna-task-#{n}" }
    tenant_id { AppConfiguration.instance.id }
    is_success { true }
    locale { 'en' }
    network { build(:nlp_text_network) }

    initialize_with { new(task_id, tenant_id, is_success, locale, network) }
  end
end

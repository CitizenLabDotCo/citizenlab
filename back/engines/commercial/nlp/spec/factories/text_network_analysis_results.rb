# frozen_string_literal: true

require 'nlp/text_network_analysis_result'

FactoryBot.define do
  factory :tna_result, class: 'NLP::TextNetworkAnalysisResult' do
    sequence :task_id
    tenant_id { AppConfiguration.instance.id }
    is_success { true }
    locale { 'en' }
    network { raise ArgumentError, 'a network must be provided explicitly' }

    initialize_with { new(task_id, tenant_id, is_success, locale, network) }
  end
end

# frozen_string_literal: true

require 'nlp/zeroshot_classification_result'

# The +:zsc_result+ and +:zsc_prediction+ factories instantiate plain old ruby
# object (PORO — not ActiveRecord objects)
FactoryBot.define do
  factory :zsc_result, class: 'NLP::ZeroshotClassificationResult' do
    sequence :task_id

    transient {
      predictions_nb { 1 }
    }

    tenant_id { AppConfiguration.instance.id }
    is_success { true }
    predictions { Array.new(predictions_nb) { build(:zsc_prediction) } }

    initialize_with do
      attrs = attributes.except(:task_id)
      new(task_id, **attrs)
    end
  end

  factory :zsc_prediction, class: 'NLP::ZeroshotClassificationResult::Prediction' do
    transient {
      input { nil }
      category { nil }
    }

    document_id { (input || create(:idea)).id }
    label_id { (category || create(:category)).id }
    confidence { 0.8 }

    initialize_with do
      new(document_id, label_id, confidence)
    end
  end
end

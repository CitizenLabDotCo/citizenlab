# frozen_string_literal: true

module Analysis
  class Summary < ::ApplicationRecord
    SUMMARIZATION_METHODS = %w[gpt4 bogus]
    FILTERS_JSON_SCHEMA_STR = Rails.root.join('engines/commercial/analysis/config/schemas/filters.json_schema').read
    FILTERS_JSON_SCHEMA = JSON.parse(FILTERS_JSON_SCHEMA_STR)

    belongs_to :analysis, class_name: 'Analysis::Analysis'
    belongs_to :background_task, class_name: 'Analysis::SummarizationTask'

    validates :summarization_method, inclusion: { in: SUMMARIZATION_METHODS }
    validates :filters, json: { schema: FILTERS_JSON_SCHEMA }
  end
end

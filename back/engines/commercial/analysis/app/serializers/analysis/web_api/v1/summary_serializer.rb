# frozen_string_literal: true

class Analysis::WebApi::V1::SummarySerializer < WebApi::V1::BaseSerializer
  attributes :summary, :filters, :accuracy, :created_at, :updated_at, :bookmarked
  attribute :missing_inputs_count do |summary|
    input_ids_then = summary.inputs_ids || []
    input_ids_now = summary.analysis.participation_context.idea_ids
    (input_ids_now - input_ids_then).size
  end
  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end

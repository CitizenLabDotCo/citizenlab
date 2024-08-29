# frozen_string_literal: true

class Analysis::WebApi::V1::SummarySerializer < WebApi::V1::BaseSerializer
  attributes :summary, :filters, :custom_field_ids, :accuracy, :created_at, :updated_at, :missing_inputs_count, :generated_at
  attribute :inputs_count do |summary|
    summary.inputs_ids&.size || 0
  end

  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end

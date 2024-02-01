# frozen_string_literal: true

class Analysis::WebApi::V1::SummarySerializer < WebApi::V1::BaseSerializer
  attributes :summary, :filters, :accuracy, :created_at, :updated_at, :generated_at
  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end

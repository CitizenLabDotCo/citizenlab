# frozen_string_literal: true

class Analysis::WebApi::V1::BackgroundTaskSerializer < WebApi::V1::BaseSerializer
  attributes(
    :auto_tagging_method,
    :failure_reason,
    :progress,
    :state,
    # Timestamps
    :started_at,
    :ended_at,
    :created_at,
    :updated_at
  )

  attribute :type do |background_task|
    background_task.task_type
  end
end

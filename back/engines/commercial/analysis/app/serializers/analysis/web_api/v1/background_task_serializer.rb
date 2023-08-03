# frozen_string_literal: true

class Analysis::WebApi::V1::BackgroundTaskSerializer < WebApi::V1::BaseSerializer
  attributes :progress, :state, :started_at, :ended_at, :updated_at, :created_at, :type, :auto_tagging_method

  attribute :type do |background_task|
    background_task.task_type
  end
end

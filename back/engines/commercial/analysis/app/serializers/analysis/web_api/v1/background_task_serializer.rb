# frozen_string_literal: true

class Analysis::WebApi::V1::BackgroundTaskSerializer < WebApi::V1::BaseSerializer
  attributes :progress, :state, :started_at, :ended_at, :created_at, :type, :auto_tagging_method
end

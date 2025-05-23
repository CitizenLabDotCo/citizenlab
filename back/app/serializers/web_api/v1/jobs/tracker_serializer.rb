# frozen_string_literal: true

class WebApi::V1::Jobs::TrackerSerializer < WebApi::V1::BaseSerializer
  set_type :job

  attributes(:progress, :total, :created_at, :updated_at)
  attribute :job_type, &:root_job_type
end

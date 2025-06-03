# frozen_string_literal: true

class WebApi::V1::Jobs::TrackerSerializer < WebApi::V1::BaseSerializer
  set_type :job

  attributes(
    :progress,
    :error_count,
    :total,
    :completed_at,
    :created_at,
    :updated_at
  )

  attribute :job_type, &:root_job_type

  belongs_to :owner, serializer: WebApi::V1::UserSerializer
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer
  belongs_to :context, serializer: proc { |record|
    case record
    when Phase
      WebApi::V1::PhaseSerializer
    when Project
      WebApi::V1::ProjectSerializer
    else
      serializer_for(record.class.name)
    end
  }
end

# frozen_string_literal: true

class WebApi::V1::BackgroundJobSerializer < WebApi::V1::BaseSerializer
  attributes :active, :failed, :last_error

  attribute :job_id do |object|
    object.args['job_id']
  end
end

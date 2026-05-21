# frozen_string_literal: true

class WebApi::V1::PhaseMethodSerializer < WebApi::V1::BaseSerializer
  attributes :method_type, :start_at, :end_at, :created_at, :updated_at

  belongs_to :phase
end

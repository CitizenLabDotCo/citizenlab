# frozen_string_literal: true

class WebApi::V1::PulseCheckSerializer < WebApi::V1::BaseSerializer
  attributes :key, :status
end

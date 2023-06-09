# frozen_string_literal: true

class WebApi::V1::ExperimentSerializer < WebApi::V1::BaseSerializer
  attributes :name, :treatment, :payload
end
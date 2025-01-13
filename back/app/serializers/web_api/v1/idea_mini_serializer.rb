# frozen_string_literal: true

class WebApi::V1::IdeaMiniSerializer < WebApi::V1::BaseSerializer
  attribute :created_at

  has_one :creation_phase, serializer: WebApi::V1::PhaseSerializer
  has_one :project, serializer: WebApi::V1::ProjectSerializer
end

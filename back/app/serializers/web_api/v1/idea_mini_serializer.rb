# frozen_string_literal: true

class WebApi::V1::IdeaMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc
  attributes :slug

  has_one :creation_phase, serializer: WebApi::V1::PhaseSerializer
  has_one :project, serializer: WebApi::V1::ProjectSerializer
end

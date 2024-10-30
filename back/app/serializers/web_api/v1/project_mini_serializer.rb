# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes(
    :title_multiloc,
    :slug
  )

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end
end

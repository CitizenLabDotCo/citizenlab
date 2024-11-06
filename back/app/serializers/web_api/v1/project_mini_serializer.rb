# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes(
    :title_multiloc,
    :slug
  )

  attribute :action_descriptors, if: proc { |_object, params|
    params[:project_descriptor_pairs]
  } do |object, params|
    params[:project_descriptor_pairs][object.id]
  end

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end
end

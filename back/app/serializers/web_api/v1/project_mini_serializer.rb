# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes(
    :title_multiloc,
    :slug
  )

  attribute :action_descriptors do |object, params|
    if params[:project_descriptor_pairs]
      params[:project_descriptor_pairs][object.id]
    else
      user_requirements_service = params[:user_requirements_service] || Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      Permissions::ProjectPermissionsService.new(object, current_user(params), user_requirements_service: user_requirements_service).action_descriptors
    end
  end

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end
end

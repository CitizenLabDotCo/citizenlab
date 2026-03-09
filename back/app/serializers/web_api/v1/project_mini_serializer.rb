# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug

  attribute :starts_days_from_now do |object|
    first_phase = object.phases.order(start_at: :asc).first
    now = AppConfiguration.timezone.now

    if first_phase && first_phase.start_at > now
      ((first_phase.start_at - now) / 1.day).floor
    end
  end

  attribute :ended_days_ago do |object|
    last_phase = object.phases.order(end_at: :desc).first
    now = AppConfiguration.timezone.now

    if last_phase&.end_at && last_phase.end_at < now
      ((now - last_phase.end_at) / 1.day).floor
    end
  end

  attribute :action_descriptors do |object, params|
    if params[:project_descriptor_pairs]
      params[:project_descriptor_pairs][object.id]
    else
      user_requirements_service = params[:user_requirements_service] || Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      Permissions::ProjectPermissionsService.new(object, current_user(params), user_requirements_service: user_requirements_service).action_descriptors
    end
  end

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :current_phase, serializer: WebApi::V1::PhaseMiniSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end
end

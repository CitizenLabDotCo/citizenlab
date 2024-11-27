# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes(
    :title_multiloc,
    :slug
  )

  attribute :starts_days_from_now do |object|
    first_phase = object.phases.order(start_at: :asc).first
    today = Time.zone.now.to_date

    if first_phase&.start_at && first_phase.start_at > today
      (first_phase.start_at.to_date - today).to_i
    end
  end

  attribute :ended_days_ago do |object|
    last_phase = object.phases.order(end_at: :desc).last
    today = Time.zone.now.to_date

    if last_phase&.end_at && last_phase.end_at < today
      (today - last_phase.end_at.to_date).to_i
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

# frozen_string_literal: true

class WebApi::V1::ProjectSerializer < WebApi::V1::BaseSerializer
  attributes(
    :description_preview_multiloc,
    :title_multiloc,
    :comments_count,
    :ideas_count,
    :followers_count,
    :include_all_areas,
    :internal_role,
    :slug,
    :visible_to,
    :created_at,
    :updated_at,
    :header_bg_alt_text_multiloc
  )

  attribute :folder_id do |project|
    project.folder&.id
  end

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :first_published_at do |object|
    object.admin_publication.first_published_at
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :action_descriptors do |object, params|
    user_requirements_service = params[:user_requirements_service] || Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    request = params[:request] || nil

    Permissions::ProjectPermissionsService.new(object, current_user(params), user_requirements_service: user_requirements_service, request: request).action_descriptors
  end

  attribute :avatars_count do |object, params|
    avatars_for_project(object, params)[:total_count]
  end

  attribute :participants_count do |object, params|
    use_cache = params[:use_cache].to_s != 'false'

    if use_cache
      participants_service.project_participants_count(object)
    else
      participants_service.project_participants_count_uncached(object)
    end
  end

  attribute :timeline_active do |object, params|
    if params[:timeline_active]
      params.dig(:timeline_active, object.id)
    else
      TimelineService.new.timeline_active object
    end
  end

  attribute :preview_token, if: proc { |object, params| can_moderate? object, params }

  has_one :admin_publication

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics, serializer: WebApi::V1::TopicSerializer
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer do |object, params|
    avatars_for_project(object, params)[:users]
  end

  has_one :user_follower, record_type: :follower, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_follower object, params
  end

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end

  def self.avatars_for_project(object, _params)
    AvatarsService.new(participants_service).avatars_for_project(object, limit: 3)
  end

  def self.participants_service
    @participants_service ||= ParticipantsService.new
  end

  def self.user_follower(object, params)
    if params[:user_followers]
      params.dig(:user_followers, [object.id, 'Project'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'Project'
      end
    end
  end

  def self.can_moderate?(object, params)
    current_user(params) && UserRoleService.new.can_moderate_project?(object, current_user(params))
  end
end

WebApi::V1::ProjectSerializer.include(IdeaAssignment::Extensions::WebApi::V1::ProjectSerializer)
WebApi::V1::ProjectSerializer.include(ContentBuilder::Extensions::WebApi::V1::ProjectSerializer)

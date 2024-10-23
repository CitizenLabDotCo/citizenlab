# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
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
    :updated_at
  )

  attribute :folder_id do |project|
    project.folder&.id
  end

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :avatars_count do |object, params|
    avatars_for_project(object, params)[:total_count]
  end

  attribute :participants_count do |object, params|
    participants_service = ParticipantsService.new
    use_cache = params[:use_cache].to_s != 'false'

    if use_cache
      participants_service.project_participants_count(object)
    else
      participants_service.project_participants_count_uncached(object)
    end
  end

  has_one :admin_publication

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics, serializer: WebApi::V1::TopicSerializer
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer do |object, params|
    avatars_for_project(object, params)[:users]
  end

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end

  def self.avatars_for_project(object, _params)
    # TODO: call only once (not a second time for counts)
    @participants_service ||= ParticipantsService.new
    AvatarsService.new(@participants_service).avatars_for_project(object, limit: 3)
  end
end

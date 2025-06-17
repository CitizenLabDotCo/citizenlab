# frozen_string_literal: true

class WebApi::V1::FolderSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_preview_multiloc, :slug, :followers_count, :created_at, :updated_at, :header_bg_alt_text_multiloc

  attribute :comments_count do |object|
    Rails.cache.fetch("#{object.cache_key}/comments_count", expires_in: 1.day) do
      object.projects.not_draft.sum(&:comments_count)
    end
  end

  attribute :ideas_count do |object|
    Rails.cache.fetch("#{object.cache_key}/ideas_count", expires_in: 1.day) do
      object.projects.not_draft.sum(&:ideas_count)
    end
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :visible_projects_count do |object, params|
    params.dig(:visible_children_count_by_parent_id, object.admin_publication.id)
  end

  attribute :avatars_count do |object, params|
    avatars_for_folder(object, params)[:total_count]
  end

  attribute :participants_count do |object, _params|
    @participants_service ||= ParticipantsService.new
    @participants_service.folder_participants_count(object)
  end

  has_one :user_follower, record_type: :follower, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_follower object, params
  end

  has_one :admin_publication, serializer: ::WebApi::V1::AdminPublicationSerializer

  has_many :images, serializer: ::WebApi::V1::ImageSerializer

  has_many :avatars, serializer: WebApi::V1::AvatarSerializer do |object, params|
    avatars_for_folder(object, params)[:users]
  end

  def self.avatars_for_folder(object, _params)
    # TODO: call only once (not a second time for counts)
    @participants_service ||= ParticipantsService.new
    AvatarsService.new(@participants_service).avatars_for_folder(object, limit: 3)
  end

  def self.user_follower(object, params)
    if params[:user_followers]
      params.dig(:user_followers, [object.id, 'ProjectFolders::Folder'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'ProjectFolders::Folder'
      end
    end
  end
end

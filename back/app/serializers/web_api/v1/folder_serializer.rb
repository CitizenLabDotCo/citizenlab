# frozen_string_literal: true

class WebApi::V1::FolderSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_preview_multiloc, :slug, :created_at, :updated_at

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :visible_projects_count do |object, params|
    params.dig(:visible_children_count_by_parent_id, object.admin_publication.id) || Pundit.policy_scope(current_user(params), Project).where(id: object.admin_publication.children.map(&:publication_id)).count
  end

  has_one :admin_publication, serializer: ::WebApi::V1::AdminPublicationSerializer

  has_many :images, serializer: ::WebApi::V1::ImageSerializer
end

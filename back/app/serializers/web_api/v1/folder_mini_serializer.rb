# frozen_string_literal: true

class WebApi::V1::FolderMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc

  attribute :visible_projects_count do |object, params|
    params.dig(:visible_children_count_by_parent_id, object.admin_publication.id)
  end

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  has_many :moderators, serializer: ::WebApi::V1::UserSerializer do |object, params|
    params.dig(:moderators_per_folder, object.id) || []
  end
end

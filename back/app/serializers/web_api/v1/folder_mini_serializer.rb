# frozen_string_literal: true

class WebApi::V1::FolderMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc

  attribute :visible_projects_count do |object, params|
    params.dig(:visible_children_count_by_parent_id, object.admin_publication.id) || Pundit.policy_scope(user_context(params), Project).where(id: object.admin_publication.children.map(&:publication_id)).count
  end
end

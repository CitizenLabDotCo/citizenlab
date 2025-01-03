# frozen_string_literal: true

class PublicApi::V2::CommentSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :body,
    :author_id,
    :idea_id,
    :parent_id,
    :created_at,
    :updated_at,
    :body_updated_at,
    :likes_count,
    :dislikes_count,
    :children_count,
    :publication_status,
    :project_id

  attribute(:body) { MultilocService.new.t(object.body_multiloc) }
end

# frozen_string_literal: true

class PublicApi::V2::CommentSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id,
    :body,
    :author_id,
    :post_id, # TODO: Labelled idea_id in spec
    :parent_id,
    :created_at,
    :updated_at,
    :body_updated_at,
    :upvotes_count,
    :downvotes_count,
    :children_count,
    :publication_status

  def body
    @@multiloc_service.t(object.body_multiloc)
  end
end

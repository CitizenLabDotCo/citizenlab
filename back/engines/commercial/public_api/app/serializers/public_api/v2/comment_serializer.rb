# frozen_string_literal: true

class PublicApi::V2::CommentSerializer < ActiveModel::Serializer
  attributes :id,
    :body,
    :author_id,
    :post_id,
    :parent_id,
    :created_at,
    :updated_at,
    :body_updated_at,
    :upvotes_count,
    :downvotes_count,
    :children_count,
    :publication_status

  attribute :post_type do
    object.post_type.underscore.dasherize
  end

  def body
    multiloc_service.t(object.body_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end

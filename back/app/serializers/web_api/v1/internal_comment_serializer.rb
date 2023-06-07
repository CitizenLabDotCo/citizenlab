# frozen_string_literal: true

class WebApi::V1::InternalCommentSerializer < WebApi::V1::BaseSerializer
  attributes :publication_status, :children_count, :created_at, :updated_at # , :author_hash

  attribute :body_multiloc do |object|
    if object.publication_status != 'deleted'
      object.body_multiloc
    end
  end

  attribute :is_admin_comment do |object|
    object.author&.admin?
  end

  belongs_to :post, polymorphic: true
  belongs_to :parent, record_type: :internal_comment, serializer: WebApi::V1::InternalCommentSerializer

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer do |object|
    if object.publication_status != 'deleted'
      object.author
    end
  end
end

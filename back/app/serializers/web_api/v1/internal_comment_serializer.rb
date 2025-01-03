# frozen_string_literal: true

class WebApi::V1::InternalCommentSerializer < WebApi::V1::BaseSerializer
  attributes :publication_status, :children_count, :created_at, :updated_at

  attribute :body do |object|
    if object.publication_status != 'deleted'
      object.body
    end
  end

  belongs_to :idea
  belongs_to :parent, record_type: :internal_comment, serializer: WebApi::V1::InternalCommentSerializer

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer do |object|
    if object.publication_status != 'deleted'
      object.author
    end
  end
end

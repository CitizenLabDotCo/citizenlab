# frozen_string_literal: true

class WebApi::V1::CommentSerializer < WebApi::V1::BaseSerializer
  attributes :likes_count, :dislikes_count, :publication_status, :children_count, :created_at, :updated_at, :anonymous, :author_hash

  attribute :body_multiloc do |object|
    if object.publication_status != 'deleted'
      object.body_multiloc
    end
  end

  attribute :is_admin_comment do |object|
    object.author&.admin?
  end

  belongs_to :idea
  belongs_to :parent, record_type: :comment, serializer: WebApi::V1::CommentSerializer

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer do |object|
    if object.publication_status != 'deleted'
      object.author
    end
  end

  has_one :user_reaction, record_type: :reaction, serializer: WebApi::V1::ReactionSerializer, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    params.dig(:vbci, object.id) || object.reactions.where(user: current_user(params)).first
  end
end

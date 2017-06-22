class Api::V1::LiteCommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :created_at
end

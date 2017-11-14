class Api::V1::External::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :created_at
end

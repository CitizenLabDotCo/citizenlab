class Api::V1::External::ExternalCommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :created_at
end

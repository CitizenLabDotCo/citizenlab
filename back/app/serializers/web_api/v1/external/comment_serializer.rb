class WebApi::V1::External::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :post_id, :post_type, :author_id, :created_at
end

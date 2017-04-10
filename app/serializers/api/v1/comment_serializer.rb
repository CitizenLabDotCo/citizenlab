class Api::V1::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :created_at, :updated_at

  belongs_to :idea
  belongs_to :author
  belongs_to :parent

end

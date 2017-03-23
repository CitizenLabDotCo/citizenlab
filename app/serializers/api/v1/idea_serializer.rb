class Api::V1::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :publication_status

  has_many :topics
  has_many :areas

  belongs_to :author
  belongs_to :lab
end

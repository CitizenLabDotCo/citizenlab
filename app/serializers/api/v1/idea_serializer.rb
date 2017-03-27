class Api::V1::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :publication_status, :images

  has_many :topics
  has_many :areas

  belongs_to :author
  belongs_to :lab

  def images
    urls = []
    object.images.each do |image|
      urls << image.url
    end
    urls
  end
end

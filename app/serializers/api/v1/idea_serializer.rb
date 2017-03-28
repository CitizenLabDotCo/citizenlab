class Api::V1::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :publication_status, :images

  has_many :topics
  has_many :areas

  belongs_to :author
  belongs_to :lab

  def images
    object.images.map do |img|
      img.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end
end

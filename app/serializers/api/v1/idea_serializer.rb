class Api::V1::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :author_name, :publication_status, :images, :upvotes_count, :downvotes_count, :created_at, :updated_at

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

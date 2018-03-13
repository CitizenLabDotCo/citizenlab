class WebApi::V1::External::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :slug, :url, :title_multiloc, :body_multiloc, :author_name, :upvotes_count, :downvotes_count, :published_at

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: WebApi::V1::ImageSerializer

  def url
      FrontendService.new.model_to_url object
  end
end
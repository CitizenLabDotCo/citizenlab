class WebApi::V1::SimilarIdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :downvotes_count, :comments_count, :published_at, :budget, :baskets_count, :url

  def url
    Frontend::UrlService.new.model_to_url object
  end
end

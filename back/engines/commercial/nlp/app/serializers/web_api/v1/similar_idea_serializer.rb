# frozen_string_literal: true

class WebApi::V1::SimilarIdeaSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :downvotes_count, :comments_count, :published_at, :budget, :baskets_count

  attribute :url do |object|
    Frontend::UrlService.new.model_to_url object
  end
end

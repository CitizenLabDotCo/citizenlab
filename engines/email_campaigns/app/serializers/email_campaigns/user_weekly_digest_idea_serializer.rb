class EmailCampaigns::UserWeeklyDigestIdeaSerializer < ActiveModel::Serializer

  N_TOP_COMMENTS = 2


  attributes :id, :url, :title_multiloc, :body_multiloc, :author_name, :upvotes_count, :downvotes_count, :comments_count, :publication_status, :published_at
  # attributes :id, :title_multiloc, :body_multiloc, :author_name, :upvotes_count, :downvotes_count, :comments_count, :publication_status, :published_at

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: WebApi::V1::ImageSerializer
  has_many :top_comments, serializer: WebApi::V1::CommentSerializer
  belongs_to :idea_status

  def url
    FrontendService.new.model_to_url object
  end

  def location_point_geojson
    RGeo::GeoJSON.encode(object.location_point)
  end

  #def children_count
  #  object.children.count
  #end

  def top_comments
    top_coms = Comment.where(idea_id: object.id)
    top_coms.sort_by{|c| -c.children.count}.take N_TOP_COMMENTS
  end

end

class Api::V1::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :author_name, :publication_status, :upvotes_count, :downvotes_count, :created_at, :updated_at, :published_at

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: ImageSerializer

  belongs_to :author
  belongs_to :project

  has_one :user_vote, if: :signed_in? do |serializer|
    votes_by_idea_id = serializer.passed_options[:vbii]
    if votes_by_idea_id
      votes_by_idea_id[object.id]
    elsif scope
      object.votes.where(user_id: scope.id)
    end
  end

  def passed_options
    @instance_options
  end

  def signed_in?
    scope
  end
end

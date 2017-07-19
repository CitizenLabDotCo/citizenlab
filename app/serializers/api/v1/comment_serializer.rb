class Api::V1::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :upvotes_count, :downvotes_count, :created_at, :updated_at

  belongs_to :idea
  belongs_to :author
  belongs_to :parent

  has_one :user_vote, if: :signed_in? do |serializer|
    serializer.cached_user_vote
  end

  def signed_in?
    scope
  end

  def cached_user_vote
    @instance_options.dig(:vbci, object.id)
  end

end

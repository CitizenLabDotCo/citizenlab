class WebApi::V1::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :upvotes_count, :downvotes_count, :publication_status, :created_at, :updated_at

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
    @instance_options.dig(:vbci, object.id) || object.votes.where(user_id: scope.id).first
  end

  def body_multiloc
    if object.publication_status != 'deleted'
      object.body_multiloc
    else
      nil
    end
  end

  def author
    if object.publication_status != 'deleted'
      object.author
    else
      nil
    end
  end

end

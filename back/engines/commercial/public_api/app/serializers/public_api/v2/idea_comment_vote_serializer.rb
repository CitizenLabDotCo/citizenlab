# frozen_string_literal: true

class PublicApi::V2::IdeaCommentVoteSerializer < PublicApi::V2::IdeaVoteSerializer
  attributes :id,
    :idea_id,
    :comment_id,
    :user_id,
    :mode,
    :created_at,
    :updated_at

  def idea_id
    object.votable.post_id
  end

  def comment_id
    object.votable_id
  end
end

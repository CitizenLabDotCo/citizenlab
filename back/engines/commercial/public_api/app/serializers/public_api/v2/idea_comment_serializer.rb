# frozen_string_literal: true

class PublicApi::V2::IdeaCommentSerializer < PublicApi::V2::CommentSerializer
  attributes :idea_id

  # TODO: Remove post_id when inherited
  def idea_id
    object.post_id
  end
end

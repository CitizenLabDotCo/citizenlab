# frozen_string_literal: true

class PublicApi::V2::InitiativeCommentSerializer < PublicApi::V2::CommentSerializer
  attributes :initiative_id

  # TODO: Remove post_id when inherited
  def initiative_id
    object.post_id
  end
end

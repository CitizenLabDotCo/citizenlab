# frozen_string_literal: true

class PublicApi::V2::IdeaVoteSerializer < ActiveModel::Serializer
  attributes :id,
    :idea_id,
    :user_id,
    :mode,
    :created_at,
    :updated_at

  def idea_id
    object.votable_id
  end
end

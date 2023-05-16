# frozen_string_literal: true

class PublicApi::V2::InitiativeVoteSerializer < ActiveModel::Serializer
  attributes :id,
    :initiative_id,
    :user_id,
    :mode,
    :created_at,
    :updated_at

  def initiative_id
    object.votable_id
  end
end

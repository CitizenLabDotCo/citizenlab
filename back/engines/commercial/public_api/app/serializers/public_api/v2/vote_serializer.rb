# frozen_string_literal: true

class PublicApi::V2::VoteSerializer < PublicApi::V2::BaseSerializer
  attributes(
    :id,
    :mode,
    :user_id,
    :votable_id,
    :created_at,
    :updated_at
  )

  attribute(:votable_type) { classname_to_type(object.votable_type) }
end

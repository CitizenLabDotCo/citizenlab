# frozen_string_literal: true

class PublicApi::V2::VoteSerializer < ActiveModel::Serializer
  attributes(
    :id,
    :mode,
    :user_id,
    :votable_id,
    :created_at,
    :updated_at
  )

  attribute :votable_type do
    object.votable_type.underscore.dasherize
  end
end

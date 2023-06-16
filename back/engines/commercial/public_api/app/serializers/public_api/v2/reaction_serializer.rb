# frozen_string_literal: true

class PublicApi::V2::ReactionSerializer < ActiveModel::Serializer
  attributes(
    :id,
    :mode,
    :user_id,
    :reactable_id,
    :created_at,
    :updated_at
  )

  attribute :reactable_type do
    object.reactable_type.underscore.dasherize
  end
end

# frozen_string_literal: true

class PublicApi::V2::ReactionSerializer < PublicApi::V2::BaseSerializer
  attributes(
    :id,
    :mode,
    :user_id,
    :reactable_id,
    :created_at,
    :updated_at
  )

  attribute(:reactable_type) { classname_to_type(object.reactable_type) }
end

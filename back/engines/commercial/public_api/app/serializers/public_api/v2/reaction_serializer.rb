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

  attribute(:post_id) do
    case object.reactable_type
    when 'Idea'
      object.reactable.id
    when 'Comment'
      object.reactable.idea_id
    end
  end

  attribute(:project_id) do
    case object.reactable_type
    when 'Idea'
      object.reactable.project_id
    when 'Comment'
      object.reactable.idea.project_id
    end
  end
end

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

  attribute(:post_type) do
    case object.reactable_type
    when 'Idea', 'Initiative'
      object.reactable_type
    when 'Comment'
      object.reactable.post_type
    end
  end

  attribute(:post_id) do
    case object.reactable_type
    when 'Idea', 'Initiative'
      object.reactable.id
    when 'Comment'
      object.reactable.post_id
    end
  end

  attribute(:project_id) do
    case object.reactable_type
    when 'Idea'
      object.reactable.project_id
    when 'Comment'
      object.reactable.post.project_id if object.reactable.post_type == 'Idea'
    end
  end
end

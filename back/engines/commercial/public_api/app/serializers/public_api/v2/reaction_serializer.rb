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

  attribute(:idea_id) do
    if object.reactable_type == 'Idea'
      object.reactable.id
    elsif object.reactable_type == 'Comment'
      object.reactable.post_type == 'Idea' ? object.reactable.post_id : nil
    end
  end

  attribute(:project_id) do
    if object.reactable_type == 'Idea'
      object.reactable&.project_id
    elsif object.reactable_type == 'Comment'
      object.reactable&.post_type == 'Idea' ? object.reactable&.post&.project_id : nil
    end
  end

  attribute(:initiative_id) do
    if object.reactable_type == 'Initiative'
      object.reactable&.id
    elsif object.reactable_type == 'Comment'
      object.reactable&.post_type == 'Initiative' ? object.reactable&.post_id : nil
    end
  end
end

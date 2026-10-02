# frozen_string_literal: true

class CustomFieldAnswerPolicy < ApplicationPolicy
  def show?
    return false if !record.custom_field

    case record.answerable_type
    when 'Idea' then record.custom_field.answers_visible_to_public? || author? || can_moderate?(record.answerable.project)
    when 'User' then !record.custom_field.hidden? && policy_for(record.answerable).view_private_attributes?
    else false
    end
  end

  private

  def author?
    user && record.answerable.author_id == user.id
  end
end

# frozen_string_literal: true

class CustomFieldAnswerPolicy < ApplicationPolicy
  def show?
    return false if record.answerable_type != 'Idea'
    return false if !record.custom_field

    author? || can_moderate?(record.answerable.project)
  end

  private

  def author?
    user && record.answerable.author_id == user.id
  end
end

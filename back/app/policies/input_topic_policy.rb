# frozen_string_literal: true

class InputTopicPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def create?
    user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end

  def update?
    user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end

  def move?
    update?
  end

  def destroy?
    update?
  end

  def show?
    true
  end

  def permitted_attributes_for_create
    [
      :icon,
      :parent_id,
      { title_multiloc: CL2_SUPPORTED_LOCALES },
      { description_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  def permitted_attributes_for_update
    permitted_attributes_for_create
  end

  def permitted_attributes_for_move
    %i[position target_id]
  end
end

# frozen_string_literal: true

class InitiativeInternalCommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(post_type: 'Initiative')
    end
  end

  def create?
    user&.active? && user&.admin?
  end

  def children?
    create?
  end

  def show?
    create?
  end

  def update?
    create?
  end

  def mark_as_deleted?
    create?
  end

  def destroy?
    false
  end

  def permitted_attributes_for_update
    attrs = %i[parent_id author_id]
    if record.author_id == user&.id
      attrs += [body_multiloc: CL2_SUPPORTED_LOCALES]
    end
    attrs
  end

  private

  def commenting_allowed?(user)
    user&.active? && user&.admin?
  end
end

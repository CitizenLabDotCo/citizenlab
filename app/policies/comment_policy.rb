class CommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def create?
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def show?
    true
  end

  def update?
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def mark_as_deleted?
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def destroy?
    update?
  end

  def permitted_attributes_for_update
    attrs = [:parent_id, :author_id]
    if record.author_id == current_user&.id
      attrs += [body_multiloc: I18n.available_locales]
    end
    attrs
  end


end

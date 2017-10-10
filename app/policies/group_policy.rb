class GroupPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all ## user&.admin?
    end
  end

  def create?
    user && user.admin?
  end

  def show?
    user && user.admin?
  end

  def by_slug?
    show?
  end

  def update?
    user && user.admin?
  end

  def destroy?
    user && user.admin?
  end

  def permitted_attributes
    if user&.admin?
      [ title_multiloc: [:en, :nl, :fr],
        user_ids: [], # membership ids?
        project_ids: []
      ]
    else
      []
    end
  end


end
# frozen_string_literal: true

class ProjectImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(project: Pundit.policy_scope(user, Project))
    end
  end

  def create?
    ProjectPolicy.new(user, record.project).update?
  end

  def show?
    ProjectPolicy.new(user, record.project).show?
  end

  def update?
    ProjectPolicy.new(user, record.project).update?
  end

  def destroy?
    ProjectPolicy.new(user, record.project).update?
  end
end

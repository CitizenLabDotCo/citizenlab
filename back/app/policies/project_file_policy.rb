# frozen_string_literal: true

class ProjectFilePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(project: scope_for(Project))
    end
  end

  def create?
    policy_for(record.project).update?
  end

  def show?
    policy_for(record.project).show?
  end

  def update?
    policy_for(record.project).update?
  end

  def destroy?
    policy_for(record.project).update?
  end
end

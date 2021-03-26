class EventPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      project_ids = Pundit.policy_scope(user, Project).pluck(:id)
      scope.where(project: project_ids)
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

class ProjectFolderImagePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(project_folder: Pundit.policy_scope(user, ProjectFolder))
    end
  end

  def create?
    ProjectFolderPolicy.new(user, record.project_folder).update?
  end

  def show?
    ProjectFolderPolicy.new(user, record.project_folder).show?
  end

  def update?
    ProjectFolderPolicy.new(user, record.project_folder).update?
  end

  def destroy?
    ProjectFolderPolicy.new(user, record.project_folder).update?
  end

end

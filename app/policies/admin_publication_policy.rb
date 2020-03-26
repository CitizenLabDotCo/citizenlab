class AdminPublicationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication: Pundit.policy_scope(user, ProjectFolder))
        .or(scope.where(publication: Pundit.policy_scope(user, Project)))
    end
  end

  def reorder?
    user&.active? && user.admin?
  end

  def show?
    case record.publication.class.name
    when 'Project'
      ProjectPolicy.new(user, record.publication).show?
    when 'ProjectFolder'
      ProjectFolderPolicy.new(user, record.publication).show?
    end
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end

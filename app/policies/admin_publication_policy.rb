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

  def show?
    case record.publication_type
    when 'Project'
      ProjectPolicy.new(user, record.publication).show?
    when 'ProjectFolder'
      ProjectFolderPolicy.new(user, record.publication).show?
    else
      raise "No policy for #{record.publication_type}"
    end
  end

  def reorder?
    user&.active? && user.admin?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end

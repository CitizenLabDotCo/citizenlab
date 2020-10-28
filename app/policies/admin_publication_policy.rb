class AdminPublicationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication: Pundit.policy_scope(user, ProjectFolders::Folder))
        .or(scope.where(publication: Pundit.policy_scope(user, Project)))
    end
  end

  def show?
    publication_class = record.publication_type.constantize
    publication_class.new(user, record.publication).show?
  rescue NameError
    raise "No policy for #{record.publication_type}"
  end

  def reorder?
    user&.active? && user.admin?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end

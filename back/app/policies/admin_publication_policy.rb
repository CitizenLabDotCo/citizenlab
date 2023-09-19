# frozen_string_literal: true

class AdminPublicationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      AdminPublication
        .publication_types
        .map { |klass| scope.where(publication: Pundit.policy_scope(user, klass)) } # scope per publication type
        .reduce(&:or) # joining partial scopes
    end
  end

  def show?
    Pundit.policy(user, record.publication).show?
  end

  def reorder?
    return false unless user&.active?
    return true if user.admin?

    record.publication_type == 'Project' &&
      record.publication.in_folder? &&
      UserRoleService.new.can_moderate?(record.publication.folder, user)
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

  def status_counts
    true
  end
end

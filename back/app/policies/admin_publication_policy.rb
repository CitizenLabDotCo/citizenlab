# frozen_string_literal: true

class AdminPublicationPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      AdminPublication
        .publication_types
        .map { |klass| scope.where(publication: scope_for(klass)) } # scope per publication type
        .reduce(&:or) # joining partial scopes
    end
  end

  def show?
    policy_for(record.publication).show?
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

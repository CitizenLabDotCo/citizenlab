# frozen_string_literal: true

class AdminPublicationPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      AdminPublication
        .publication_types
        .map { |klass| scope.where(publication: scope_for_klass(klass)) } # scope per publication type
        .reduce(&:or) # joining partial scopes
    end

    private

    def scope_for_klass(klass)
      # If the publication is a project, we usually hide hidden projects
      if klass == Project && !context[:include_hidden]
        scope_for(klass).not_hidden
      else
        scope_for(klass)
      end
    end
  end

  def index_select_and_order_by_ids?
    true
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

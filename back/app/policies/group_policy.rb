# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      return scope.all if user.admin?

      moderated_projects = ::Project.where(id: user.moderatable_project_ids)
      return scope.all if moderated_projects.any? { |p| p.visible_to == 'public' }

      group_ids = groups_associated_to(moderated_projects)
      group_ids.present? ? scope.where(id: group_ids) : scope.none # skip the DB query if we can
    end

    def groups_associated_to(projects)
      group_projects = projects.select { |p| p.visible_to == 'groups' }
      return ::Group.none if group_projects.blank? # skip the DB query if we can

      ::Group.joins(:groups_projects)
        .where(groups_projects: { project_id: group_projects })
    end
  end

  def create?
    active? && admin?
  end

  def show?
    return false unless active?

    show_to_active?
  end

  def by_slug?
    show?
  end

  def update?
    active? && admin?
  end

  def destroy?
    active? && admin?
  end

  def permitted_attributes
    [
      :membership_type,
      { title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  private

  def show_to_active?
    admin? || show_to_moderator?
  end

  def show_to_moderator?
    # No need to check that the user is a moderator with +user.project_moderator?+.
    # We just rely on the fact that the list of 'moderatable' projects will be empty.
    projects = ::Project.where(id: user.moderatable_project_ids)

    if projects.any? { |p| p.visible_to == 'public' }
      true
    else
      grp_projects = projects.select { |p| p.visible_to == 'groups' }
      grp_projects.blank? ? false : ::GroupsProject.exists?(project_id: grp_projects, group_id: record.id)
    end
  end
end

GroupPolicy.prepend(SmartGroups::Patches::GroupPolicy)

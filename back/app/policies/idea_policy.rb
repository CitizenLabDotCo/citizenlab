# frozen_string_literal: true

class IdeaPolicy < ApplicationPolicy
  EXCLUDED_REASONS_FOR_UPDATE = %w[posting_disabled posting_limited_max_reached].freeze
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user
        projects = Pundit.policy_scope(user, Project)
        scope.where(project: projects, publication_status: 'published')
      else
        scope
          .left_outer_joins(project: [:admin_publication])
          .where(publication_status: 'published')
          .where(projects: { visible_to: 'public', admin_publications: { publication_status: %w[published archived] } })
      end
    end
  end

  def index_xlsx?
    active? && (admin? || user&.project_moderator?)
  end

  def index_mini?
    admin? && active?
  end

  def create?
    return false if user&.blocked?
    return true if record.draft?
    return true if active? && UserRoleService.new.can_moderate_project?(record.project, user)
    return false if !active? && record.participation_method_on_creation.sign_in_required_for_posting?

    reason = ParticipationContextService.new.posting_idea_disabled_reason_for_project(record.project, user)
    raise_not_authorized(reason) if reason

    (!user || owner?) && ProjectPolicy.new(user, record.project).show?
  end

  def show?
    return false if record.participation_method_on_creation.never_show?

    project_show = ProjectPolicy.new(user, record.project).show?
    return true if project_show && %w[draft published].include?(record.publication_status)

    active? && (owner? || UserRoleService.new.can_moderate_project?(record.project, user))
  end

  def by_slug?
    show?
  end

  def update?
    return false if record.participation_method_on_creation.never_update?
    return true if record.draft? || (user && UserRoleService.new.can_moderate_project?(record.project, user))
    return false unless active? && owner? && ProjectPolicy.new(user, record.project).show?

    pcs = ParticipationContextService.new
    pcs_posting_reason = pcs.posting_idea_disabled_reason_for_project(record.project, user)
    raise_not_authorized(pcs_posting_reason) if pcs_posting_reason && EXCLUDED_REASONS_FOR_UPDATE.exclude?(pcs_posting_reason)
    true
  end

  def destroy?
    update?
  end

  private

  def owner?
    record.author_id == user.id
  end
end

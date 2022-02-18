class IdeaPolicy < ApplicationPolicy
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
        scope.where(project: projects, publication_status: ['published', 'closed'])
      else
        scope
          .left_outer_joins(project: [:admin_publication])
          .where(publication_status: ['published', 'closed'])
          .where(projects: {visible_to: 'public', admin_publications: {publication_status: ['published', 'archived']}})
      end
    end
  end

  def index_xlsx?
    admin? && active?
  end

  def index_mini?
    admin? && active?
  end

  def create?
    return true if record.draft?
    return false if !active?
    return true if UserRoleService.new.can_moderate_project? record.project, user

    reason = ParticipationContextService.new.posting_idea_disabled_reason_for_project(record.project, user)
    raise_not_authorized(reason) if reason

    owner? && ProjectPolicy.new(user, record.project).show?
  end

  def show?
    project_show = ProjectPolicy.new(user, record.project).show?
    return true if project_show && %w[draft published closed].include?(record.publication_status)

    active? && (owner? || UserRoleService.new.can_moderate_project?(record.project, user))
  end

  def by_slug?
    show?
  end

  def update?
    bypassable_reasons = %w[posting_disabled]
    pcs = ParticipationContextService.new
    pcs_posting_reason = pcs.posting_idea_disabled_reason_for_project(record.project, user)
    record.draft? || (user && UserRoleService.new.can_moderate_project?(record.project, user)) ||
      (
        active? && owner? &&
          (pcs_posting_reason.nil? || bypassable_reasons.include?(pcs_posting_reason)) &&
          ProjectPolicy.new(user, record.project).show?
      )
  end

  def destroy?
    update?
  end

  private

  def owner?
    record.author_id == user.id
  end
end

# frozen_string_literal: true

class IdeaPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      project_scope = scope_for(Project)

      if user&.admin?
        scope.all
      elsif user&.project_or_folder_moderator? # We do this as a separate logic branch to avoid the moderatable_projects call for normal users
        scope
          .submitted_or_published.where(author: user)
          .or(scope.published.where_pmethod(&:supports_public_visibility?))
          .or(scope.where(id: sponsored_ideas))
          .or(scope.where(project: UserRoleService.new.moderatable_projects(user)))
          .where(project: project_scope)
      elsif user
        scope
          .submitted_or_published.where(author: user)
          .or(scope.published.where_pmethod(&:supports_public_visibility?))
          .or(scope.where(id: sponsored_ideas))
          .where(project: project_scope)
      else
        scope
          .left_outer_joins(project: [:admin_publication])
          .published
          .where_pmethod(&:supports_public_visibility?)
          .where(project: project_scope)
      end
    end

    private

    def sponsored_ideas
      # Small optimization, where we check the feature flag to avoid the extra
      # query, since this feature is turned off way more often than turned on
      return [] unless AppConfiguration.instance.feature_activated?('input_cosponsorship')

      Idea.joins(:cosponsorships).where(cosponsorships: { user_id: user.id })
    end
  end

  def index_xlsx?
    active? && (admin? || (user && UserRoleService.new.can_moderate_project?(record.project, user)))
  end

  def index_mini?
    active_admin?
  end

  def index_survey_submissions?
    active?
  end

  def create?
    return false if user&.blocked?
    return true if record.draft?
    return true if active? && UserRoleService.new.can_moderate_project?(record.project, user)
    return false if !active? && !record.participation_method_on_creation.supports_inputs_without_author?

    reason = Permissions::ProjectPermissionsService.new(
      record.project,
      user,
      request: record.request # Only present if pmethod.everyone_tracking_enabled? is true
    ).denied_reason_for_action 'posting_idea'
    raise_not_authorized(reason) if reason

    (!user || owner?) && policy_for(record.project).show?
  end

  def show?
    if record.participation_method_on_creation.supports_public_visibility?
      project_show = policy_for(record.project).show?
      return true if project_show && %w[draft published].include?(record.publication_status)
      return true if record.cosponsors.include?(user)
    elsif record.draft?
      return true
    end

    active? && (owner? || UserRoleService.new.can_moderate_project?(record.project, user))
  end

  def show_xlsx?
    owner?
  end

  def by_slug?
    show?
  end

  def draft_by_phase?
    show? && owner?
  end

  def update?
    return false if !record.participation_method_on_creation.supports_edits_after_publication? && record.published?
    return true if (record.draft? && owner?) || (user && UserRoleService.new.can_moderate_project?(record.project, user))
    return false if !active? || !owner?

    permission_action = record.will_be_published? ? 'posting_idea' : 'editing_idea'
    posting_denied_reason = Permissions::IdeaPermissionsService.new(record, user).denied_reason_for_action permission_action
    raise_not_authorized(posting_denied_reason) if posting_denied_reason

    true
  end

  def destroy?
    (user && UserRoleService.new.can_moderate_project?(record.project, user)) || update?
  end

  private

  def owner?
    user && record.author_id == user.id
  end
end

IdeaPolicy.prepend(BulkImportIdeas::Patches::IdeaPolicy)

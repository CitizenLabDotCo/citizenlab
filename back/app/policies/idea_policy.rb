# frozen_string_literal: true

class IdeaPolicy < ApplicationPolicy
  # Denied reasons that still allow a draft to be created. The posting check
  # runs again when the draft is published (see #update?), and the author can
  # fix any of these before then: registration unfinished, verification
  # pending, required profile fields still blank.
  #
  # user_not_signed_in is deliberately not here. It only arises where posting
  # requires an account, and there a signed-out draft is a dead row: publishing
  # needs owner?, which matches on author_id, and the only route to becoming
  # that owner is a claim token, which is issued solely where posting is open to
  # everyone (see IdeasController#create). So nothing would ever re-check it.
  # Signed-out drafts on everyone-permitted phases are unaffected: on those
  # phases nothing is denied in the first place.
  DEFERRABLE_DENIED_REASONS = %w[user_not_active user_not_verified user_missing_requirements].freeze

  class Scope < ApplicationPolicy::Scope
    def resolve
      project_scope = scope_for(Project)

      if user&.admin?
        scope.all
      elsif user&.moderator? # We do this as a separate logic branch to avoid the moderatable_projects call for normal users
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
    active? && (admin? || user&.moderator?)
  end

  def index_mini?
    active_admin?
  end

  def index_survey_submissions?
    active?
  end

  def create?
    return false if user&.blocked?
    return true if active? && UserRoleService.new.can_moderate_project?(record.project, user)

    phase = record.creation_phase_with_fallback
    return false if !phase

    reason = if record.draft?
      draft_denied_reason(phase)
    else
      return false if !active? && !record.participation_method_on_creation.supports_inputs_without_author?

      posting_denied_reason(phase)
    end
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
    return false if !record.participation_method_on_creation.supports_edits_after_publication? && record.published? && !record.will_be_published?
    return true if (record.draft? && owner?) || (user && UserRoleService.new.can_moderate_project?(record.project, user))
    return false if !active? || !owner?

    permission_action = record.will_be_published? ? 'posting_idea' : 'editing_idea'
    posting_denied_reason = Permissions::IdeaPermissionsService.new(record, user).denied_reason_for_action permission_action
    raise_not_authorized(posting_denied_reason) if posting_denied_reason

    policy_for(record.project).show?
  end

  def destroy?
    (user && UserRoleService.new.can_moderate_project?(record.project, user)) || update?
  end

  private

  def draft_denied_reason(phase)
    reason = posting_denied_reason(phase)
    DEFERRABLE_DENIED_REASONS.include?(reason) ? nil : reason
  end

  def posting_denied_reason(phase)
    Permissions::PhasePermissionsService.new(
      phase,
      user,
      request: record.request # Only present if pmethod.everyone_tracking_enabled? is true
    ).denied_reason_for_action('posting_idea')
  end

  def owner?
    user && record.author_id == user.id
  end
end

IdeaPolicy.prepend(BulkImportIdeas::Patches::IdeaPolicy)

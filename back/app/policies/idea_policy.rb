# frozen_string_literal: true

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
        scope.where(project: Pundit.policy_scope(user, Project), publication_status: %w[published closed])
      else
        resolve_for_visitor
      end
    end

    private

    def resolve_for_visitor
      scope
        .left_outer_joins(project: [:admin_publication])
        .where(publication_status: %w[published closed])
        .where(projects: { admin_publications: { publication_status: %w[published archived] } })
    end
  end

  def index_xlsx?
    admin?
  end

  def index_mini?
    admin?
  end

  def create?
    return true if record.draft?
    return true if user&.active_admin_or_moderator?(record.project_id)

    reason = ParticipationContextService.new.posting_idea_disabled_reason_for_project(record.project, user)
    raise_not_authorized(reason) if reason

    active? && owner? && ProjectPolicy.new(user, record.project).show?
  end

  def show?
    active? && owner? ||
      user&.active_admin_or_moderator?(record.project_id) ||
      (
        ProjectPolicy.new(user, record.project).show? &&
          %w[draft published closed].include?(record.publication_status)
      )
  end

  def by_slug?
    show?
  end

  def update?
    # TODO: remove this after Gents project
    bypassable_reasons = %w[posting_disabled]
    bypassable_reasons << 'not_permitted' if AppConfiguration.instance.host == 'participatie.stad.gent'
    pcs = ParticipationContextService.new
    pcs_posting_reason = pcs.posting_idea_disabled_reason_for_project(record.project, user)
    record.draft? || user&.active_admin_or_moderator?(record.project_id) ||
      (
        active? && owner? &&
          (pcs_posting_reason.nil? || bypassable_reasons.include?(pcs_posting_reason)) &&
          ProjectPolicy.new(user, record.project).show?
      )
  end

  def destroy?
    update?
  end

  def permitted_attributes
    shared = [
      :publication_status,
      :project_id,
      :author_id,
      :location_description,
      :proposed_budget,
      { location_point_geojson: [:type, { coordinates: [] }],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        body_multiloc: CL2_SUPPORTED_LOCALES,
        topic_ids: [],
        area_ids: [] }
    ]
    if admin_or_project_moderator?
      [:idea_status_id, :budget] + shared + [phase_ids: []]
    else
      shared
    end
  end

  private

  def admin_or_project_moderator?
    user&.admin? || (record.class != Class && user&.project_moderator?(record.project_id))
  end

  def owner?
    record.author_id == user.id
  end
end

IdeaPolicy.prepend_if_ee('IdeaAssignment::Patches::IdeaPolicy')
IdeaPolicy::Scope.prepend_if_ee('ProjectPermissions::Patches::IdeaPolicy::Scope')

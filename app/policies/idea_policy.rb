class IdeaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user
        scope.where(project: Pundit.policy_scope(user, Project), publication_status: ['published', 'closed'])
      else
        scope
          .left_outer_joins(project: [:admin_publication])
          .where(publication_status: ['published', 'closed'])
          .where(projects: {visible_to: 'public', admin_publications: {publication_status: ['published', 'archived']}})
      end
    end
  end

  def index_xlsx?
    user&.admin?
  end

  def index_mini?
    user&.admin?
  end

  def create?
    pcs = ParticipationContextService.new
    record.draft? ||
    user&.active_admin_or_moderator?(record.project_id) ||
    (
      user&.active? &&
      record.author_id == user.id &&
      !pcs.posting_idea_disabled_reason_for_project(record.project, user) &&
      ProjectPolicy.new(user, record.project).show?
    )
  end

  def show?
    (
      user&.active? &&
      record.author_id == user.id
    ) ||
    user&.active_admin_or_moderator?(record.project_id) ||
    (
      ProjectPolicy.new(user, record.project).show? &&
      %w(draft published closed).include?(record.publication_status)
    )
  end

  def by_slug?
    show?
  end

  def update?
    # TODO: remove this after Gents project
    bypassable_reasons = %w[posting_disabled]
    bypassable_reasons << 'not_permitted' if Tenant.current.host == 'participatie.stad.gent'
    pcs = ParticipationContextService.new
    pcs_posting_reason = pcs.posting_idea_disabled_reason_for_project(record.project, user)
    record.draft? || user&.active_admin_or_moderator?(record.project_id) ||
      (
        user&.active? &&
        record.author_id == user.id &&
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
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      body_multiloc: CL2_SUPPORTED_LOCALES,
      topic_ids: [],
      area_ids: []
    ]
    if admin_or_project_moderator?
      [:idea_status_id, :budget] + shared + [phase_ids: []]
    else
      shared
    end
  end

  def admin_or_project_moderator?
    user&.admin? || (record.class != Class && user&.project_moderator?(record.project_id))
  end
end

IdeaPolicy.include_if_ee('IdeaAssignment::Extensions::IdeaPolicy')

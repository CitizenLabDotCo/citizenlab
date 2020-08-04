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

  def create?
    pcs = ParticipationContextService.new 
    record.draft? ||
    user&.active_admin_or_moderator?(record.project_id) ||
    (
      user&.active? &&
      record.author_id == user.id &&
      !pcs.posting_disabled_reason_for_project(record.project, user) &&
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
    create?
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
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      body_multiloc: CL2_SUPPORTED_LOCALES,
      topic_ids: [],
      area_ids: []
    ]
    if user&.admin? || (record.class != Class && user&.project_moderator?(record.project_id))
      [:idea_status_id, :budget, :assignee_id] + shared + [phase_ids: []]
    else
      shared
    end
  end


end

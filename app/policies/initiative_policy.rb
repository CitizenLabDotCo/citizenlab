class InitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication_status: ['published', 'closed'])
    end
  end

  def index_xlsx?
    user&.active? && user.admin?
  end

  def create?
    ps = PermissionsService.new 
    record.draft? ||
    (user&.active? && user.admin?) ||
    (
      user&.active? &&
      record.author_id == user.id &&
      !PermissionsService.new.posting_initiative_disabled_reason(user)
    )
  end

  def show?
    (
      user&.active? &&
      record.author_id == user.id
    ) ||
    (user&.active? && user.admin?) ||
    %w(draft published closed).include?(record.publication_status)
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

  def allowed_transitions?
    user&.admin?
  end

  def permitted_attributes
    shared = [
      :publication_status,
      :author_id,
      :location_description,
      :header_bg,
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      body_multiloc: CL2_SUPPORTED_LOCALES,
      topic_ids: [],
      area_ids: []
    ]
    if user&.admin?
      [:assignee_id, *shared]
    else
      shared
    end
  end

  # Helper method that is not part of the pundit conventions but is used
  # publicly
  def moderate?
    user&.active? && user.admin?
  end
end

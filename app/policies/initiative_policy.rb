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

  def create?
    record.draft? ||
    (user&.active? && user.admin?) ||
    (
      user&.active? &&
      record.author_id == user.id
    )
  end

  def show?
    record.draft? ||
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

  def permitted_attributes
    [
      :publication_status,
      :author_id,
      :location_description,
      :header_bg,
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      body_multiloc: CL2_SUPPORTED_LOCALES
    ]
  end
end

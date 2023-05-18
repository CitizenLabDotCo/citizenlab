# frozen_string_literal: true

class InitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication_status: %w[published closed])
    end
  end

  def index_xlsx?
    active? && admin?
  end

  def create?
    return true if record.draft?
    return true if active? && admin?

    reason = posting_denied_reason user
    raise_not_authorized reason if reason

    active? && owner?
  end

  def show?
    return true if active? && owner?
    return true if active? && admin?

    %w[draft published closed].include?(record.publication_status)
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
    admin?
  end

  def permitted_attributes
    shared = [
      :publication_status,
      :author_id,
      :location_description,
      :header_bg,
      :anonymous,
      { location_point_geojson: [:type, { coordinates: [] }],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        body_multiloc: CL2_SUPPORTED_LOCALES,
        topic_ids: [],
        area_ids: [] }
    ]

    admin? ? [:assignee_id, *shared] : shared
  end

  private

  def posting_denied_reason(user)
    'not_signed_in' unless user
  end

  def owner?
    user && record.author_id == user.id
  end
end

InitiativePolicy.prepend(GranularPermissions::Patches::InitiativePolicy)

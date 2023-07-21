# frozen_string_literal: true

class InitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      not_draft = scope.where(publication_status: %w[published closed])

      if user && UserRoleService.new.can_moderate_initiatives?(user)
        not_draft
      else
        not_draft.left_outer_joins(:initiative_initiative_status)
          .where.not(initiative_initiative_statuses: {
            initiative_status_id: InitiativeStatus.where(code: InitiativeStatus::NOT_PUBLICLY_VISIBLE_CODES).select(:id)
          })
          .or(not_draft.where(author: user))
      end
    end
  end

  def index_xlsx?
    active? && UserRoleService.new.can_moderate_initiatives?(user)
  end

  def create?
    return true if active? && can_moderate?

    reason = posting_denied_reason user
    raise_not_authorized reason if reason

    active? && owner?
  end

  def show?
    return true if active? && owner?
    return true if active? && can_moderate?

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
    can_moderate?
  end

  def permitted_attributes
    shared = [
      :publication_status,
      :location_description,
      :header_bg,
      :anonymous,
      { location_point_geojson: [:type, { coordinates: [] }],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        body_multiloc: CL2_SUPPORTED_LOCALES,
        topic_ids: [],
        area_ids: [] }
    ]

    can_moderate? ? [:author_id, :assignee_id, *shared] : shared
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

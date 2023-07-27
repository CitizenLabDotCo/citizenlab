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

      if UserRoleService.new.can_moderate_initiatives?(user)
        not_draft
      else
        not_draft.with_status_code(InitiativeStatus::NOT_REVIEW_CODES)
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

    if active? && owner?
      return false if review_required?

      true
    end
  end

  def show?
    return false if !can_moderate? && !owner? && record.review_status?
    return true if active? && (owner? || can_moderate?)

    %w[draft published closed].include?(record.publication_status)
  end

  def by_slug?
    show?
  end

  def update?
    create?
  end

  def destroy?
    create?
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

  def review_required?
    Initiative.review_required?
  end
end

InitiativePolicy.prepend(GranularPermissions::Patches::InitiativePolicy)

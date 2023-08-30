# frozen_string_literal: true

class InitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      published = scope.where(publication_status: 'published')

      if UserRoleService.new.can_moderate_initiatives?(user)
        published
      elsif user&.active?
        published.left_outer_joins(:cosponsors_initiatives).with_status_code(InitiativeStatus::NOT_REVIEW_CODES)
          .or(published.where(author: user))
          .or(published.where(cosponsors_initiatives: { user: user }))
      else
        published.with_status_code(InitiativeStatus::NOT_REVIEW_CODES)
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
    return true if active? && (owner? || cosponsor? || can_moderate?)
    return false if record.review_status?

    true
  end

  def by_slug?
    show?
  end

  def update?
    return true if active? && can_moderate?

    create? && !record.editing_locked
  end

  def destroy?
    create?
  end

  def accept_cosponsorship_invite?
    cosponsor?
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
      { cosponsor_ids: [] },
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

  def cosponsor?
    user && record&.cosponsors&.include?(user)
  end
end

InitiativePolicy.prepend(GranularPermissions::Patches::InitiativePolicy)

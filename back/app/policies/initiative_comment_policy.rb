# frozen_string_literal: true

class InitiativeCommentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(post: scope_for(Initiative))
    end
  end

  def index_xlsx?
    user&.admin?
  end

  def create?
    return unless active?
    return true if admin?

    owner? && commenting_allowed?(user)
  end

  def children?
    show?
  end

  def show?
    policy_for(record.post).show?
  end

  def update?
    create?
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end

  def permitted_attributes_for_update
    attrs = %i[parent_id author_id]
    if record.author_id == user&.id
      attrs += [body_multiloc: CL2_SUPPORTED_LOCALES]
    end
    attrs
  end

  private

  def commenting_allowed?(user)
    !Permissions::InitiativePermissionsService.new(user).denied_reason_for_action 'commenting_initiative'
  end

  def owner?
    user && (record.author_id == user.id)
  end
end
